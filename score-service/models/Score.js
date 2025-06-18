const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  competitionId: { type: String, required: true },
  score: { type: Number, required: true },
  labelsTarget: [String],      
  labelsSubmission: [String],  
  date: { type: Date, default: Date.now }
});
scoreSchema.index({ userId: 1, competitionId: 1 }, { unique: true }); 
module.exports = mongoose.model('Score', scoreSchema);
