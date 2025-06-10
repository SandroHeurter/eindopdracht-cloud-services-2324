const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  deadline: { type: Date, required: true },
  image: { type: String, required: true },
  imageHash: { type: String, required: true, index: true },
  createdBy: { type: String, required: true }, 
  createdByEmail: { type: String, required: true }, 
  isClosed: { type: Boolean, default: false }   
}, {
  timestamps: true
});

module.exports = mongoose.model('Target', targetSchema);
