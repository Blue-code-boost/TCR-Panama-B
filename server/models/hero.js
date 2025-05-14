// server/models/hero.js
const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  subtitle:    { type: String, required: true, trim: true },
  description: { type: String, required: true },
  btn1: {
    text: String,
    url:  String
  },
  btn2: {
    text: String,
    url:  String
  },
  // Opcional: si quieres subir imagenes con Multer,
  // aquí guardas la ruta tras upload.
  imageUrl:    { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hero', heroSchema);
