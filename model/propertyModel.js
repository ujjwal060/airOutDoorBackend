const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
  vendorId: { type: String, required: true },
  propertyNickname: {
    type: String,
    required: true,
  },
  propertyName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
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
  priceRange: {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
  },
  cancellationPolicy: {
    type: String,
  },
  pricePerGroupSize:
  {
    groupSize: { type: Number },
    groupPrice: { type: Number },
  },
  images: { type: [String] },
  details: {
    acreage: {
      type: Number,
      required: true,
    },
    guidedHunt: {
      type: String,
      required: true,
    },
    guestLimitPerDay: {
      type: Number,
      required: true,
    },
    guestPricePerDay: {
      type: Number,
      required: true,
    },
    lodging: {
      type: String,
      enum: [],
      required: true,
    },
    shootingRange: {
      type: String,
      required: true,
    },
    optionalExtendedDetails: {
      type: String,
    },
    instantBooking: {
      type: Boolean,
      default: false,
    },
  },

  location: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  startDate: { type: Date },
  endDate: { type: Date },
  isApproveByAdmin: {
    type: Boolean,
    default: false
  },
  isFavourite: {
    type: Boolean,
    require: false,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Property = mongoose.model('Property', propertySchema);
module.exports = Property;