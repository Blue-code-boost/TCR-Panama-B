// models/Gallery.js
const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url:      { type: String, required: true },
  caption:  { type: String, default: '' },
  date:     { type: Date,   default: Date.now }
});

module.exports = mongoose.model('Gallery', GallerySchema);
