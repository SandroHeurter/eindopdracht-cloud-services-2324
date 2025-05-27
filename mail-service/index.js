require('dotenv').config();
const amqp = require('amqplib');
const handleMail = require('./mail');

async function start() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();

    const queue = process.env.QUEUE_NAME || 'mailQueue';
    await channel.assertQueue(queue, { durable: false });

    console.log(`📩 Wacht op berichten in queue: ${queue}`);

    channel.consume(queue, (msg) => {
      const content = msg.content.toString();
      console.log('📧 Mail ontvangen:', content);
      const message = JSON.parse(content);
      handleMail(message);
      channel.ack(msg);
    });
  } catch (err) {
    console.error('❌ Fout bij verbinden met RabbitMQ:', err.message);
  }
}

start();
