const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({

  propertyNickname: {
    type: String,
    // required: true,
  },
  category: {
    type: String,
    enum: [],
    // required: true,
  },
  propertyDescription: {
    type: String,
    // required: true,
  },
  instantBooking: {
    type: String,
    // default: false,
  },
  priceRange: {
    min: {
      type: Number,
      // required: true,
    },
    max: {
      type: Number,
      // required: true,
    },
  },
  guestLimitPerDay: {
    type: Number,
    // required: true,
  },
  guestPricePerDay: {
    type: Number,
    // required: true,
  },
  cancellationPolicy: {
    type: String,
  },
  pricePerGroupSize: [
    {
      guests: { type: Number },
      price: { type: Number },
    },
  ],

  // images: { 
  //   type: [String] 
  // },


  details: {
    acreage: {
      type: Number,
      // required: true,
    },
    guidedHunt: {
      type: String,
      // required: true,
    },
    guestLimitPerDay: {
      type: Number,
      // required: true,
    },
    lodging: {
      type: String,
      // enum: [],
      // required: true,
    },
    shootingRange: {
      type: String,
      // required: true,
    },
    optionalExtendedDetails: {
      type: String,
    },
    instantBooking: {
      type: String,
      // default: false,
    },
  },
  

  location: {
    address: {
      type: String,
      // required: true,
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

  calendar: {
    availableDates: [
      {
        from: { type: Date },
        to: { type: Date },
      },
    ],
  },


  isApproveByAdmin: {
    type: Boolean,
    default: false
  }
});

const Listing = mongoose.model('SubmitProperty', listingSchema);
module.exports = Listing;
