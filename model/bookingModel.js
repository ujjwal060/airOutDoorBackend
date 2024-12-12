const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  vendorId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  guestDetails: [
    {
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
    },
  ],
  bookingStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  totalAmount: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  refund: {
    refundId: { type: String },
    refundDate: {
      type: Date,
    },
    refundAmount: {
      type: String,
    },
    cancellationFee: {
      type: String,
    },
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "failed", "refunded"],
    default: "pending",
  },
  paymentIntentId: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
