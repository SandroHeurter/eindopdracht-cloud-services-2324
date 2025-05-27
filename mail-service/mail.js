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

  const username = data.username || data.email;

  const mailOptions = {
    from: `"Photo Prestiges" <${process.env.GMAIL_USER}>`,
    to: data.email,
    subject: 'Bevestiging registratie bij Photo Prestiges',
    text: `Welkom bij Photo Prestiges!\n\nHier zijn je inloggegevens:\nGebruikersnaam: ${username}\nWachtwoord: ${data.password}\n\nVeel plezier met speuren!\n\nLet op: Bewaar deze gegevens goed.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail verstuurd naar ${data.email}`);
  } catch (err) {
    console.error('❌ Fout bij verzenden e-mail:', err);
  }
};
