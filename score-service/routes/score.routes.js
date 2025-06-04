const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const { getImageLabelsFromUrl, calculateScore } = require('../googleVision');

// Externe score-bepaling + opslaan + teruggeven
router.post('/', async (req, res) => {
  try {
    const { userId, competitionId, targetImageUrl, submissionImageUrl } = req.body;

    if (!userId || !competitionId || !targetImageUrl || !submissionImageUrl) {
      return res.status(400).json({ message: 'userId, competitionId, targetImageUrl en submissionImageUrl zijn verplicht.' });
    }

    // 1. Labels ophalen via Google Vision (direct via URL!)
    const labelsTarget = await getImageLabelsFromUrl(targetImageUrl);
    const labelsSubmission = await getImageLabelsFromUrl(submissionImageUrl);

    // 2. Score berekenen op basis van label-overlap
    const score = calculateScore(labelsTarget, labelsSubmission);

    // 3. Opslaan
    const newScore = new Score({
      userId,
      competitionId,
      score,
      labelsTarget,
      labelsSubmission,
    });

    await newScore.save();

    // 4. Teruggeven
    res.status(201).json({
      score: newScore.score,
      labelsTarget,
      labelsSubmission,
      _id: newScore._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Scores ophalen (optioneel filter)
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

// Scores van 1 user
router.get('/user/:userId', async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.params.userId });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
