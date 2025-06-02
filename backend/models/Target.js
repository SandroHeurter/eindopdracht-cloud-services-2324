const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  deadline: { type: Date, required: true },
  image: { type: String, required: true },      // <--- toegevoegd!
  imageHash: { type: String, required: true, index: true }, // <--- toegevoegd!
  createdBy: { type: String, required: true } // of type: mongoose.Schema.Types.ObjectId als je dat elders gebruikt
}, {
  timestamps: true
});

module.exports = mongoose.model('Target', targetSchema);
