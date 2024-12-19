const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  vendorId: { type: String },
  propertyNickname: {
    type: String,
    required: true,
  },
  propertyName: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  propertyDescription: {
    type: String,
    required: true,
  },
  instantBooking: {
    type: Boolean,
    default: false,
  },
  cancellationPolicy: {
    type: String,
  },
  images: { type: [String] },
  location: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      // required: true,
    },
    state: {
      type: String,
      // required: true,
    },
    postalCode: {
      type: String,
      // required: true,
    },
    latitude: {
      type: Number,
      // required: true,
    },
    longitude: {
      type: Number,
      // required: true,
    },
  },

  adminCommission: { type: Number },
  pricePerPersonPerDay: { type: Number },
  cancellationCharge: { type: Number, default: 0  },
  customFields: [],

  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  averageRating: { type: Number, default: 0 },
  disabledDates: [{ type: Date }],
  startDate: { type: Date },
  endDate: { type: Date },
  isApproveByAdmin: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    require: false,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
