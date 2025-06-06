const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const hashImage = require('../middleware/hashImage');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 📤 Upload een bestand als submission (multipart/form-data)
router.post('/', authMiddleware, upload.single('image'), hashImage, async (req, res) => {
  const { targetId } = req.body;

  if (!req.file || !targetId) {
    return res.status(400).json({ message: 'Afbeelding en targetId zijn verplicht.' });
  }

  try {
    const imageUrl = `/uploads/${req.file.filename}`;
    const imageHash = req.imageHash;

    // 1. Ophalen van de target via backend-service
    const backendUrl = process.env.BACKEND_URL || 'http://backend:3000';
    let target;
    try {
      const resp = await axios.get(`${backendUrl}/api/targets/${targetId}`);
      target = resp.data;
    } catch (err) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Kan target niet vinden of backend niet bereikbaar.' });
    }

    if (!target || !target.imageHash) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Target heeft geen afbeelding (imageHash ontbreekt).' });
    }

    // ===>>> DEADLINE CHECK HIER!
    const deadline = new Date(target.deadline);
    if (Date.now() > deadline.getTime()) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'De deadline voor deze wedstrijd is verstreken. Je kunt niet meer inzenden.' });
    }

    // 2. Vergelijk hashes: exacte foto is niet toegestaan
    if (target.imageHash === imageHash) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Je mag niet exact dezelfde afbeelding als het target uploaden.' });
    }

    // 3. Check op DUBBELE hash voor deze gebruiker/target!
    const exists = await Submission.findOne({
      targetId,
      userId: req.user.id,
      imageHash
    });

    if (exists) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Je hebt deze afbeelding al geüpload voor deze target.' });
    }

    const newSubmission = new Submission({
      image: imageUrl,
      imageHash,
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

    if (submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Je mag alleen je eigen submissions verwijderen.' });
    }

    const imagePath = path.join(__dirname, '..', submission.image);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    } else {
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
