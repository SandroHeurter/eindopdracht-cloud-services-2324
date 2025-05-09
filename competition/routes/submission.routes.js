const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// 📤 Upload een bestand als submission (multipart/form-data)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const { targetId } = req.body;

  if (!req.file || !targetId) {
    return res.status(400).json({ message: 'Afbeelding en targetId zijn verplicht.' });
  }

  try {
    const imageUrl = `/uploads/${req.file.filename}`;

    const newSubmission = new Submission({
      image: imageUrl,
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
