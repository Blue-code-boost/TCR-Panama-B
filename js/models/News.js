// models/News.js
const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  date:    { type: Date,   required: true },
  content: { type: String, required: true }
});

module.exports = mongoose.model('News', NewsSchema);
