const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  pilots:   [String],
  position: Number,
  // Nuevo campo:
  imageUrl: { type: String, default: '' }
});

module.exports = mongoose.model('Team', teamSchema);
