// models/Info.js
const mongoose = require('mongoose');

const InfoSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Info', InfoSchema);
