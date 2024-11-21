const Property = require('../model/propertyModel')
const Category = require('../model/catogriesModel')

const getProperties = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const properties = await Property.find({ vendorId: vendorId });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Error fetching properties" });
  }
};

const addProperty = async (req, res) => {
  try {
    const {
      vendorId,
      property_nickname,
      category,
      property_description,
      instant_booking,
      priceRange,
      property_name,
      acreage,
      guided_hunt,
      guest_limit,
      lodging,
      shooting_range,
      extended_details,
      address,
      city,
      zip_code,
      state,
      country,
      latitude,
      longitude,
      checkIn,
      checkOut,
      groupPrice,
      groupSize,
      guest_perPrice,
    } = req.body;

    const parsedPriceRange = JSON.parse(priceRange);

    let imageUrl = [];
    if (req.fileLocations) {
      imageUrl = req.fileLocations;
    }
    const newListing = new Property({
      vendorId: vendorId,
      propertyNickname: property_nickname,
      category,
      propertyDescription: property_description,
      priceRange: {
        min: parseInt(parsedPriceRange.min),
        max: parseInt(parsedPriceRange.max),
      },
      details: {
        instantBooking: instant_booking,
        acreage,
        guidedHunt: guided_hunt,
        guestLimitPerDay: guest_limit,
        lodging,
        shootingRange: shooting_range,
        optionalExtendedDetails: extended_details,
        guestPricePerDay: guest_perPrice
      },
      images: imageUrl,
      propertyName: property_name,
      acreage,
      guidedHunt: guided_hunt,
      guestLimit: guest_limit,
      lodging,
      shootingRange: shooting_range,
      extendedDetails: extended_details,
      location: {
        address,
        city,
        zipCode: zip_code,
        state,
        country,
        latitude,
        longitude,
      },
      startDate: checkIn,
      endDate: checkOut,
      pricePerGroupSize: {
        groupPrice: groupPrice,
        groupSize: groupSize,
      },
    });

    const savedListing = await newListing.save();
    res.status(200).json(savedListing);
  } catch (error) {
    //console("Error while adding property:", error);
    res.status(401).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const updatedData = {
      name: req.body.name || property.name,
      description: req.body.description || property.description,
      amenities: req.body.amenities || property.amenities,
      pricing: req.body.pricing || property.pricing,
      startDate: req.body.startDate
        ? new Date(req.body.startDate)
        : property.startDate,
      endDate: req.body.endDate ? new Date(req.body.endDate) : property.endDate,
      category: req.body.category || property.category,
      imageUrl: req.fileLocation ? req.fileLocation : property.imageUrl,
    };

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.json(updatedProperty);
  } catch (err) {
    res.status(500).json({ message: "Error updating property" });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    //console(propertyId);
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const deletedProperty = await Property.findByIdAndDelete(propertyId);
    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({
      message: "Property deleted successfully",
      updatedProperty: deletedProperty,
    });

    res.json({
      message: "Property deleted successfully",
      updatedProperty: propertyId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting property" });
  }
};

const getfeaturedProperty = async (req, res) => {
  try {
    const featuredProperties = await Property.find()
    .populate({
      path: 'category',
      select: 'name',
    });
    if (featuredProperties.length === 0) {
      return res
        .status(404)
        .json({ message: "No featured properties found for today." });
    }

    const result = await Promise.all(featuredProperties.map(async (property) => {
      const category = await Category.findById(property.category);
      
      return {
        ...property.toObject(),
        category: category ? category.name : null 
      };
    }));

    return res.status(200).json({
      status: 200,
      message: "get all",
      data: result
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const favouriteproperty = async (req, res) => {
  const { propertyId, isFavorite } = req.body;
  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).send("Property not found");
    }

    property.isFavorite = isFavorite;
    await property.save();

    res.status(200).send({ message: "Favorite status updated successfully" });
  } catch (error) {
    //console(error);
    res.status(500).send("Error updating favorite status");
  }
};
const getFavoriteProperty = async (req, res) => {
  try {
    const favProperty = await Property.find({ isFavorite: true });
    //console("favorite properties", favProperty);
    res.status(200).json({
      success: true,
      favProperty,
      message: "fetched favourite Properties",
    });
  } catch (error) {
    res.status(501).json({
      success:false,
      message:"Cant fetch Favourite Properties"
    })
  }
};
module.exports = {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty,
  favouriteproperty,
  getfeaturedProperty,
  getFavoriteProperty,
};
