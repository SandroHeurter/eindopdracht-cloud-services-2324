const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

module.exports = async function handleMail(data) {
  const mailOptions = {
    from: `"Photo Prestiges" <${process.env.GMAIL_USER}>`,
    to: data.email,
    subject: data.subject || 'Bericht van Photo Prestiges',
    text: data.text || 'Je hebt een bericht van Photo Prestiges.'
  };
  // 👇 Toegevoegde logregel voor debuggen
  console.log(`Mail wordt verstuurd naar: ${mailOptions.to} | Subject: ${mailOptions.subject}`);

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail verstuurd naar ${data.email}`);
  } catch (err) {
    console.error('❌ Fout bij verzenden e-mail:', err);
  }
};

