const express = require('express');
const router = express.Router();
const Target = require('../models/Target');
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// 🆕 Maak een target aan (met userId)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    // Sla userId op als eigenaar
    const newTarget = new Target({
      name,
      userId: req.user.id // Belangrijk: userId moet bestaan in je Target-model!
      // eventueel andere velden
    });

    await newTarget.save();

    res.status(201).json({ message: 'Target aangemaakt', target: newTarget });
  } catch (err) {
    console.error('❌ Fout bij aanmaken target:', err);
    res.status(500).json({ message: 'Fout bij aanmaken target.' });
  }
});

// 🗑️ Verwijder een target (alleen door eigenaar)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);

    if (!target) {
      return res.status(404).json({ message: 'Target niet gevonden.' });
    }

    // LET OP: gebruik hier createdBy!
    if (target.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Je mag alleen je eigen targets verwijderen.' });
    }

    // Zoek alle submissions bij deze target
    const submissions = await Submission.find({ targetId: target._id });

    // Verwijder de uploads van alle submissions
    submissions.forEach(sub => {
      if (sub.image) {
        const filePath = path.join(__dirname, '..', sub.image);
        fs.unlink(filePath, err => {
          if (err) {
            console.error('Fout bij verwijderen bestand:', filePath, err.message);
          }
        });
      }
    });

    // Verwijder de submissions uit de database
    await Submission.deleteMany({ targetId: target._id });

    // Verwijder het target zelf
    await Target.findByIdAndDelete(req.params.id);

    res.json({ message: 'Target en gekoppelde submissions + uploads verwijderd.' });
  } catch (error) {
    console.error('❌ Fout bij verwijderen target:', error);
    res.status(500).json({ message: 'Fout bij verwijderen van de target.' });
  }
});


module.exports = router;
