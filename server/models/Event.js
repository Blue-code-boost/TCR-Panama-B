// models/Event.js
const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  date:     { type: Date,   required: true },
  location: { type: String, required: true }
});
module.exports = mongoose.model('Event', EventSchema);
