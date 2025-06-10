const express = require('express');
const router = express.Router();
const Target = require('../models/Target');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload'); // multer instance
const hashImage = require('../middleware/hashImage');
const fs = require('fs');
const amqp = require('amqplib');

// Target aanmaken
router.post('/', authMiddleware, upload.single('image'), hashImage, async (req, res) => {
  const { title, description, location, deadline } = req.body;

  if (
    !title?.trim() ||
    !description?.trim() ||
    !location?.trim() ||
    !deadline?.trim() ||
    !req.file
  ) {
    return res.status(400).json({ message: 'Alle velden zijn verplicht.' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  const imageHash = req.imageHash;

  const exists = await Target.findOne({ imageHash });
  if (exists) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Er bestaat al een target met exact deze afbeelding.' });
  }

  try {
    // Sla target op met standaard isClosed: false
    const newTarget = new Target({
      title,
      description,
      location,
      deadline,
      image: imageUrl,
      imageHash,
      createdBy: req.user.id,
      createdByEmail: req.user.email, 
      isClosed: false, 
    });
    await newTarget.save();

    // Stuur target naar RabbitMQ voor clock-service
    (async () => {
      try {
        const conn = await amqp.connect(process.env.MESSAGE_QUEUE || 'amqp://messagebroker');
        const channel = await conn.createChannel();
        await channel.assertQueue('target_deadlines', { durable: true });
        channel.sendToQueue('target_deadlines', Buffer.from(JSON.stringify(newTarget)));
        setTimeout(() => { conn.close(); }, 500);
      } catch (err) {
        console.error('❌ Kan niet naar RabbitMQ sturen:', err.message);
      }
    })();

    res.status(201).json({
      message: 'Target succesvol aangemaakt',
      target: newTarget
    });
  } catch (error) {
    console.error('❌ Fout bij opslaan target:', error);
    res.status(500).json({ message: 'Fout bij het opslaan van de target.' });
  }
});

// ✅ Alle targets ophalen
router.get('/', async (req, res) => {
  try {
    const targets = await Target.find();
    res.json(targets);
  } catch (err) {
    res.status(500).json({ message: 'Fout bij ophalen van alle targets.' });
  }
});

// Target ophalen op ID
router.get('/:id', async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'Target niet gevonden.' });
    res.json(target);
  } catch (err) {
    res.status(500).json({ message: 'Fout bij ophalen target.' });
  }
});

// PATCH endpoint om target te sluiten (voor clock-service)
router.patch('/:id/close', async (req, res) => {
    console.log('Target ID ontvangen:', req.params.id); // 👈 debug-log

  try {
    const target = await Target.findByIdAndUpdate(
      req.params.id,
      { isClosed: true },
      { new: true }
    );
    if (!target) return res.status(404).json({ message: 'Target niet gevonden.' });
    res.json({ message: 'Target is gesloten.', target });
  } catch (err) {
    res.status(500).json({ message: 'Fout bij sluiten van target.' });
  }
});

module.exports = router;
