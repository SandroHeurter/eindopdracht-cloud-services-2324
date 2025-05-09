const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/auth');

// 📤 Een gebruiker uploadt een foto als deelname aan een target
router.post('/', authMiddleware, async (req, res) => {
  const { image, targetId } = req.body;

  if (!image || !targetId) {
    return res.status(400).json({ message: 'Image en targetId zijn verplicht.' });
  }

  try {
    const newSubmission = new Submission({
      image,
      targetId,
      userId: req.user.id
    });

    await newSubmission.save();

    res.status(201).json({
      message: 'Deelname succesvol opgeslagen.',
      submission: newSubmission
    });
  } catch (error) {
    console.error('❌ Fout bij opslaan submission:', error);
    res.status(500).json({ message: 'Fout bij het opslaan van de deelname.' });
  }
});

module.exports = router;
