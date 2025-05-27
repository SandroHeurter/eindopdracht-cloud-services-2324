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

// 🗑️ Verwijder een submission (alleen door eigenaar)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission niet gevonden.' });
    }

    // Alleen de eigenaar mag verwijderen
    if (submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Je mag alleen je eigen submissions verwijderen.' });
    }

    await Submission.findByIdAndDelete(req.params.id);

    res.json({ message: 'Submission verwijderd.' });
  } catch (error) {
    console.error('❌ Fout bij verwijderen submission:', error);
    res.status(500).json({ message: 'Fout bij verwijderen van de deelname.' });
  }
});

module.exports = router;
