// models/Blog.js
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  date:     { type: Date,   required: true },
  content:  { type: String, required: true },
  images:   [String]        // ahora es un array de nombres de fichero
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);
