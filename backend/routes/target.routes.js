const express = require('express');
const router = express.Router();
const Target = require('../models/Target');
const authMiddleware = require('../middleware/auth'); // Zorg dat dit pad klopt

// Target aanmaken (alleen voor ingelogde gebruikers)
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, location, deadline } = req.body;

  if (!title || !description || !location || !deadline) {
    return res.status(400).json({ message: 'Alle velden zijn verplicht.' });
  }

  try {
    const newTarget = new Target({
      title,
      description,
      location,
      deadline,
      createdBy: req.user.id // ⬅️ gekoppeld aan ingelogde gebruiker
    });
    await newTarget.save();

    res.status(201).json({
      message: 'Target succesvol aangemaakt',
      target: newTarget
    });
  } catch (error) {
    console.error('❌ Fout bij opslaan target:', error);
    res.status(500).json({ message: 'Fout bij het opslaan van de target.' });
  }
});

// Alle targets ophalen
router.get('/', async (req, res) => {
  try {
    const targets = await Target.find();
    res.status(200).json(targets);
  } catch (error) {
    console.error('❌ Fout bij ophalen targets:', error);
    res.status(500).json({ message: 'Fout bij het ophalen van targets.' });
  }
});

module.exports = router;
