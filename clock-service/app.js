// clock-service/app.js
const amqp = require('amqplib');
const axios = require('axios');

const QUEUE = 'target_deadlines';

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

  channel.consume(QUEUE, async (msg) => {
    const target = JSON.parse(msg.content.toString());
    const deadline = new Date(target.deadline).getTime();
    const now = Date.now();
    const msLeft = deadline - now;

    if (msLeft > 0) {
      console.log(`[CLOCK] Target ${target._id} deadline in ${(msLeft/1000/60).toFixed(1)} min`);
      setTimeout(async () => {
        // Stuur seintje: PATCH naar backend om target te sluiten
        try {
          await axios.patch(
            `http://backend:3000/api/targets/${target._id}/close`, 
            { isClosed: true }
          );
          console.log(`[CLOCK] Target ${target._id} gesloten na deadline`);
        } catch (err) {
          console.error(`[CLOCK] Fout bij sluiten target ${target._id}:`, err.message);
        }
      }, msLeft);
    } else {
      // Deadline al verstreken
      try {
        await axios.patch(
          `http://backend:3000/api/targets/${target._id}/close`, 
          { isClosed: true }
        );
        console.log(`[CLOCK] Target ${target._id} direct gesloten (deadline verstreken)`);
      } catch (err) {
        console.error(`[CLOCK] Fout bij direct sluiten target ${target._id}:`, err.message);
      }
    }

    channel.ack(msg);
  });

  console.log("⏰ Clock service draait!");
}

startClockService();
