const Property = require('../model/propertyModel')

const getProperties = async (req, res) => {
  try {
    const {vendorId}=req.params;
    const properties = await Property.find({vendorId:vendorId})
    res.json(properties)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching properties' })
  }
}

const addProperty = async (req, res) => {
  try {
    const { name, description, amenities, pricing, startDate, endDate, vendorId, category } = req.body;
    let imageUrl = [];
    if (req.fileLocations) {
      imageUrl = req.fileLocations;
    }
    
    const newProperty = new Property({
      name,
      description,
      amenities,
      pricing,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      imageUrl,
      category,
      vendorId
    });

    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const updatedData = {
      name: req.body.name || property.name,
      description: req.body.description || property.description,
      amenities: req.body.amenities || property.amenities,
      pricing: req.body.pricing || property.pricing,
      startDate: req.body.startDate ? new Date(req.body.startDate) : property.startDate,
      endDate: req.body.endDate ? new Date(req.body.endDate) : property.endDate,
      category: req.body.category || property.category,
      imageUrl: req.fileLocation ? req.fileLocation : property.imageUrl,
    };

    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updatedProperty);
  } catch (err) {
    res.status(500).json({ message: 'Error updating property' });
  }
};


const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    res.json({ message: 'Property deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting property' })
  }
}

const getfeaturedProperty=async(req,res)=>{
  try {
    const currentDate = new Date();
    const featuredProperties = await Property.find({
      // dateAvailable: { $gte: currentDate },
    });

    if (featuredProperties.length === 0) {
      return res.status(404).json({ message: 'No featured properties found for today.' });
    }

    return res.status(200).json(featuredProperties);
  } catch (error) {
    return res.status(500).json({ message:error.message});
  }
}

module.exports = {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty,
  getfeaturedProperty
}
