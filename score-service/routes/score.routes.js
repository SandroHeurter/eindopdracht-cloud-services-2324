const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// Nieuwe score opslaan
router.post('/', async (req, res) => {
  try {
    const { userId, competitionId, score } = req.body;
    if (!userId || !competitionId || typeof score !== 'number') {
      return res.status(400).json({ message: 'userId, competitionId en score zijn verplicht.' });
    }
    const newScore = new Score({ userId, competitionId, score });
    await newScore.save();
    res.status(201).json(newScore);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Alle scores ophalen (optioneel filter op competitie)
router.get('/', async (req, res) => {
  try {
    const { competitionId } = req.query;
    const query = competitionId ? { competitionId } : {};
    const scores = await Score.find(query);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Optioneel: scores van 1 user
router.get('/user/:userId', async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.params.userId });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
