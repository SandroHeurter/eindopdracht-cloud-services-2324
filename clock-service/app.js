const amqp = require('amqplib');
const axios = require('axios');
const QUEUE = 'target_deadlines';
const MAIL_QUEUE = process.env.MAIL_QUEUE || 'mailQueue'; // <-- Aangepast

async function connectWithRetry() {
  while (true) {
    try {
      return await amqp.connect('amqp://messagebroker');
    } catch (err) {
      console.log("[CLOCK] Kan niet verbinden met RabbitMQ, probeer opnieuw in 3s...");
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

async function startClockService() {
  const conn = await connectWithRetry();
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.assertQueue(MAIL_QUEUE, { durable: false });

  channel.consume(QUEUE, async (msg) => {
    const target = JSON.parse(msg.content.toString());
    const deadline = new Date(target.deadline).getTime();
    const now = Date.now();
    const msLeft = deadline - now;

    const handleAfterDeadline = async () => {
      try {
        // 1. Sluit target in backend (indien nog niet gebeurd)
        await axios.patch(
          `http://backend:3000/api/targets/${target._id}/close`,
          { isClosed: true }
        );
        console.log(`[CLOCK] Target ${target._id} gesloten na deadline`);

        // 2. Haal alle submissions op uit competition-service
        const submissionsResp = await axios.get(`http://competition:3010/api/submissions?targetId=${target._id}`);
        const submissions = submissionsResp.data || [];

        if (submissions.length === 0) {
          console.log(`[CLOCK] Geen submissions gevonden voor target ${target._id}`);
          return;
        }

        // 3. Haal ALLE scores op in 1x voor deze target
        const scoresResp = await axios.get(`http://score:3030/api/score?competitionId=${target._id}`);
        const scores = scoresResp.data || [];

        // 4. Merge: submission + score per userId
        let results = submissions.map(sub => {
          const scoreObj = scores.find(s => s.userId === String(sub.userId));
          return {
            ...sub,
            score: scoreObj ? scoreObj.score : 0,
            submittedAt: new Date(sub.createdAt || sub.submittedAt)
          };
        });

        // 5. Bepaal winnaar: hoogste score, dan snelste inzending
        results.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.submittedAt - b.submittedAt;
        });
        const winnaar = results[0];

        // 6. Mail target-eigenaar met overzicht + winnaar
        const overzichtRows = results.map(r =>
          `• ${r.userEmail || '-'}: score ${r.score} (${r.submittedAt.toLocaleString()})${r._id === winnaar._id ? ' [WINNAAR]' : ''}`
        ).join('\n');

        console.log('Stuur mail naar', MAIL_QUEUE, target.createdByEmail);

        channel.sendToQueue(MAIL_QUEUE, Buffer.from(JSON.stringify({
          email: target.createdByEmail,
          subject: `Resultaat van je Photo Prestiges target: ${target.title}`,
          text: `Hallo!\n\nDe wedstrijd voor je target "${target.title}" is gesloten. Hier is het resultaat:\n\n${overzichtRows}\n\nGefeliciteerd aan ${winnaar.userEmail} als winnaar!\n`
        })));

        // 7. Mail iedere deelnemer zijn/haar individuele score en of ze gewonnen hebben
        for (const r of results) {
          channel.sendToQueue(MAIL_QUEUE, Buffer.from(JSON.stringify({
            email: r.userEmail,
            subject: `Uitslag van jouw deelname aan "${target.title}"`,
            text: `Hallo!\n\nDe wedstrijd voor "${target.title}" is afgelopen.\nJouw score: ${r.score}\n\n${r._id === winnaar._id ? 'Gefeliciteerd! Je bent de winnaar! 🎉' : 'Helaas, je hebt niet gewonnen deze keer.'}\n`
          })));
        }

        console.log(`[CLOCK] Overzicht en individuele scores gemaild voor target ${target._id}`);

      } catch (err) {
        console.error(`[CLOCK] Fout bij afhandeling target ${target._id}:`, err.message);
      }
    };

    if (msLeft > 0) {
      console.log(`[CLOCK] Target ${target._id} deadline in ${(msLeft/1000/60).toFixed(1)} min`);
      setTimeout(handleAfterDeadline, msLeft);
    } else {
      await handleAfterDeadline();
    }
    channel.ack(msg);
  });

  console.log("⏰ Clock service draait!");
}
startClockService();
