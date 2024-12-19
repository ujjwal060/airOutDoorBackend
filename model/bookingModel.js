const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  vendorId: {
    type:String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
  },
  guestDetails: [{
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    phoneNo: {
      type: String,
    },
  }],
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  totalAmount: {
    type: String,
    required: true,
  },
  paidAmount: {
    type: String,
    required: true,
    default:0
  },
  vendorAmount:{
    type: String,
    required: true,
    default:0
  },
  adminAmount:{
    type: String,
    required: true,
    default:0
  },
  cancellatonAmount:{
    type: String,
    required: true,
    default:0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed','refunded'],
    default: 'pending',
  },
  paymentIntentId: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
