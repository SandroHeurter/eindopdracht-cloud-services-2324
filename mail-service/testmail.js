const nodemailer = require('nodemailer');
require('dotenv').config();

async function main() {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  let info = await transporter.sendMail({
    from: `"Photo Prestiges Test" <${process.env.GMAIL_USER}>`,
    to: "sandrouwemailadres@gmail.com",
    subject: "Test e-mail",
    text: "Dit is een testmail vanuit Nodemailer."
  });

  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
