const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  date:        { type: Date,   required: true },
  description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
