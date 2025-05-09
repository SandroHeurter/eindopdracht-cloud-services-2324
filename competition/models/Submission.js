const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
    // Hier kun je in de toekomst valideren of het een geldige base64 string of URL is
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Target',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // creëert automatisch createdAt en updatedAt velden
});

module.exports = mongoose.model('Submission', submissionSchema);
