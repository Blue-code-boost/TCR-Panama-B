// models/Result.js
const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  event:   { type: String, required: true },
  date:    { type: Date,   required: true },
  first:   { type: String, required: true },
  second:  { type: String, required: true },
  third:   { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);
