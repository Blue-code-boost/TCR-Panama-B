// models/countdown.js
const mongoose = require('mongoose');

const countdownSchema = new mongoose.Schema({
  target: { type: Date, required: true }
});

// Siempre trabajaremos con un único documento
module.exports = mongoose.model('Countdown', countdownSchema);
