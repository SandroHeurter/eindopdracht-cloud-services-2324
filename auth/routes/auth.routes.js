const express = require('express');
const router = express.Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');

// 👇 Helperfunctie voor mail-service aanroepen via RabbitMQ
async function stuurRegistratieMail(email, password) {
  try {
    const connection = await amqp.connect(process.env.MESSAGE_QUEUE || 'amqp://messagebroker');
    const channel = await connection.createChannel();
    await channel.assertQueue('register_mail', { durable: false });
    const msg = JSON.stringify({ email, password });
    channel.sendToQueue('register_mail', Buffer.from(msg));
    setTimeout(() => {
      connection.close();
    }, 500);
    console.log('Mail-bericht naar RabbitMQ verstuurd:', email);
  } catch (err) {
    console.error('Fout bij versturen mail naar RabbitMQ:', err);
  }
}

// ✅ Gebruiker registreren
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Gebruiker bestaat al.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    // Stuur mail naar RabbitMQ!
    stuurRegistratieMail(email, password);

    res.status(201).json({ message: 'Gebruiker geregistreerd!', email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Er ging iets mis op de server.' });
  }
});

// ✅ Gebruiker inloggen
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Gebruiker niet gevonden.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Ongeldig wachtwoord.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, message: 'Inloggen gelukt!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Er ging iets mis op de server.' });
  }
});

// ✅ Beschermde route om token te testen
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Geen of ongeldig token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: 'Toegang toegestaan', user: decoded });
  } catch (err) {
    res.status(403).json({ message: 'Token ongeldig of verlopen.' });
  }
});

// 👇 Exporteer routes
module.exports = router;
