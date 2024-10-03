const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  amenities: { type: String, required: true },
  pricing: { type: String, required: true },
  availability: { type: String, required: true },
  imageUrl: { type: [String] },
  vendorId: {
    type: String,
    required: true
  },
})

const Property = mongoose.model('Property', propertySchema)
module.exports = Property
