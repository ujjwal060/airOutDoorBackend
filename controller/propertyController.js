const Property = require('../model/propertyModel')

// Get all properties
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find()
    res.json(properties)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching properties' })
  }
}

// Add new property
const addProperty = async (req, res) => {
  try {
    const { name, description, amenities, pricing, availability, vendorId } = req.body
    const imageUrl = req.file ? req.file.path : null

    const newProperty = new Property({
      name,
      description,
      amenities,
      pricing,
      availability,
      imageUrl,
      vendorId, // Ensure vendorId is included
    })

    await newProperty.save()
    res.status(201).json(newProperty)
  } catch (err) {
    res.status(400).json({ message: 'Error adding property' })
  }
}

// Update property
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }

    const updatedData = {
      name: req.body.name || property.name,
      description: req.body.description || property.description,
      amenities: req.body.amenities || property.amenities,
      pricing: req.body.pricing || property.pricing,
      availability: req.body.availability || property.availability,
      imageUrl: req.file ? req.file.path : property.imageUrl,
      vendorId: req.body.vendorId || property.vendorId, // Update vendorId if provided
    }

    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updatedData, { new: true })
    res.json(updatedProperty)
  } catch (err) {
    res.status(500).json({ message: 'Error updating property' })
  }
}

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    res.json({ message: 'Property deleted successfully' })
  } catch (err) {
    console.error(err)  // Log the error to help debug
    res.status(500).json({ message: 'Error deleting property' })
  }
}

module.exports = {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty,
}
