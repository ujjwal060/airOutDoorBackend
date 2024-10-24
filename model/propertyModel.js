const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  amenities: { type: String, required: true },
  pricing: { type: String, required: true },
  startDate: { type: Date, required: true },  // Date type for start date
  endDate: { type: Date, required: true },    // Date type for end date
  imageUrl: { type: [String] },
  category: { type: String, required: true },
  vendorId: { type: String, required: true },
});

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;