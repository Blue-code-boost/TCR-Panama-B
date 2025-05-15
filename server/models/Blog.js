const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  date:    { type: Date,   required: true },
  content: { type: String, required: true },
  banner:  { type: String },       // nueva propiedad
  images:  [{ type: String }]      // las imágenes adicionales
});

module.exports = mongoose.model('Blog', BlogSchema);
