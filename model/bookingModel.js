// /models/bookingModel.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  camper: { type: Boolean, required: true },
  pricing: { type: Number, required: true }, // Added for storing calculated pricing
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
