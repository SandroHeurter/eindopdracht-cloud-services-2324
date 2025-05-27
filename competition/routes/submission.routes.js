const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

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

// 🗑️ Verwijder een submission (alleen door eigenaar) + verwijder bestand uit uploads-map
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

    // Bestandsverwijdering
    // submission.image is bijvoorbeeld "/uploads/bestand.jpg"
    // Je moet __dirname + '..' + submission.image gebruiken om het juiste pad te krijgen
    const imagePath = path.join(__dirname, '..', submission.image);

    // Check of het bestand bestaat
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    } else {
      // Je hoeft niet te falen als het bestand er niet meer is, maar dit kun je loggen
      console.warn(`Bestand bestaat niet meer: ${imagePath}`);
    }

    await Submission.findByIdAndDelete(req.params.id);

    res.json({ message: 'Submission en bestand verwijderd.' });
  } catch (error) {
    console.error('❌ Fout bij verwijderen submission:', error);
    res.status(500).json({ message: 'Fout bij verwijderen van de deelname.' });
  }
});

module.exports = router;
