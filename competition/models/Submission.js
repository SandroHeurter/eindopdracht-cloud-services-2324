const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  image: { type: String, required: true },
  imageHash: { type: String, required: true, index: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Target', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true }, 
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
