// backend/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },         
  imagePublicId: { type: String },   
  eventDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
