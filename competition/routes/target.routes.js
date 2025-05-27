const express = require('express');
const router = express.Router();
const Target = require('../models/Target');
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/auth');

// 🗑️ Verwijder een target (alleen door eigenaar)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);

    if (!target) {
      return res.status(404).json({ message: 'Target niet gevonden.' });
    }

    // Alleen de eigenaar mag verwijderen
    if (target.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Je mag alleen je eigen targets verwijderen.' });
    }

    // Optioneel: verwijder submissions gekoppeld aan deze target
    await Submission.deleteMany({ targetId: target._id });

    await Target.findByIdAndDelete(req.params.id);

    res.json({ message: 'Target en gekoppelde submissions verwijderd.' });
  } catch (error) {
    console.error('❌ Fout bij verwijderen target:', error);
    res.status(500).json({ message: 'Fout bij verwijderen van de target.' });
  }
});

module.exports = router;
