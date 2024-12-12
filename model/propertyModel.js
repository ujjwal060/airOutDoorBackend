const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
  vendorId: { type: String,},
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
      // enum:["Yes","No","Optional"],
      required: true,
    },
    guestLimitPerDay: {
      type: Number,
      required: true,
    },
    guestPricePerDay: {
      type: Number,
      // required: true,
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
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  averageRating: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  isApproveByAdmin: {
    type: Boolean,
    default: false
  },
  isFavorite: {
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