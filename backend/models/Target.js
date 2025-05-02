const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  deadline: { type: Date, required: true },
  createdBy: { type: String, required: true } // komt uit JWT token (req.user.id)
}, {
  timestamps: true
});

module.exports = mongoose.model('Target', targetSchema);
