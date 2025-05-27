const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  deadline: Date,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
});

module.exports = mongoose.model('Target', targetSchema);
