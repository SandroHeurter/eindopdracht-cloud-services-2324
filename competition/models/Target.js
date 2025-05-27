// competition/models/Target.js
const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  // vul de fields in zoals je zelf wilt!
  name: String,
  // eventueel andere velden
});

module.exports = mongoose.model('Target', targetSchema);
