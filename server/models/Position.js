// models/Position.js
const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
  position: { type: Number, required: true },
  pilot:    { type: String, required: true },
  team:     { type: String, required: true },
  points:   { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Position', PositionSchema);
