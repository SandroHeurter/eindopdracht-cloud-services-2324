const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  competitionId: { type: String, required: true },
  score: { type: Number, required: true },
  labelsTarget: [String],      
  labelsSubmission: [String],  
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', scoreSchema);
