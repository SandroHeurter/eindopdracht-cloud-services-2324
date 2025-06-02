const express = require('express');
const router = express.Router();
const Target = require('../models/Target');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload'); // multer instance
const hashImage = require('../middleware/hashImage'); // zie vorige antwoorden!
const fs = require('fs');

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

  // Optioneel: duplicate-check
  const exists = await Target.findOne({ imageHash });
  if (exists) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Er bestaat al een target met exact deze afbeelding.' });
  }

  try {
    const newTarget = new Target({
      title,
      description,
      location,
      deadline,
      image: imageUrl,
      imageHash,
      createdBy: req.user.id
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

module.exports = router;
