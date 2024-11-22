const Property = require("../model/propertyModel");
const Category = require("../model/catogriesModel");

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
        guestPricePerDay: guest_perPrice,
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
    // Find the property by ID
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Parse priceRange if provided
    let parsedPriceRange = property.priceRange;
    if (req.body.priceRange) {
      parsedPriceRange = JSON.parse(req.body.priceRange);
    }

    // Update image URLs if new ones are provided
    let imageUrl = property.images;
    if (req.fileLocations) {
      imageUrl = req.fileLocations;
    }

    // Prepare updated data
    const updatedData = {
      vendorId: req.body.vendorId || property.vendorId,
      propertyNickname: req.body.property_nickname || property.propertyNickname,
      category: req.body.category || property.category,
      propertyDescription:
        req.body.property_description || property.propertyDescription,
      priceRange: {
        min: parsedPriceRange.min || property.priceRange.min,
        max: parsedPriceRange.max || property.priceRange.max,
      },
      details: {
        instantBooking:
          req.body.instant_booking !== undefined
            ? req.body.instant_booking
            : property.details.instantBooking,
        acreage: req.body.acreage || property.details.acreage,
        guidedHunt: req.body.guided_hunt || property.details.guidedHunt,
        guestLimitPerDay:
          req.body.guest_limit || property.details.guestLimitPerDay,
        lodging: req.body.lodging || property.details.lodging,
        shootingRange:
          req.body.shooting_range || property.details.shootingRange,
        optionalExtendedDetails:
          req.body.extended_details || property.details.optionalExtendedDetails,
        guestPricePerDay:
          req.body.guest_perPrice || property.details.guestPricePerDay,
      },
      images: imageUrl,
      propertyName: req.body.property_name || property.propertyName,
      location: {
        address: req.body.address || property.location.address,
        city: req.body.city || property.location.city,
        zipCode: req.body.zip_code || property.location.zipCode,
        state: req.body.state || property.location.state,
        country: req.body.country || property.location.country,
        latitude: req.body.latitude || property.location.latitude,
        longitude: req.body.longitude || property.location.longitude,
      },
      startDate: req.body.checkIn
        ? new Date(req.body.checkIn)
        : property.startDate,
      endDate: req.body.checkOut
        ? new Date(req.body.checkOut)
        : property.endDate,
      pricePerGroupSize: {
        groupPrice: req.body.groupPrice || property.pricePerGroupSize.groupPrice,
        groupSize: req.body.groupSize || property.pricePerGroupSize.groupSize,
      },
    };

    // Update the property
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true } // Return the updated document
    );

    // Respond with the updated property
    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: "Error updating property", error: error.message });
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
    const { categoryId } = req.body;

    let query = {};

    if (categoryId) {
      query = { category: categoryId };
    }

    const featuredProperties = await Property.find(query).populate({
      path: "category",
      select: "name",
    });
    if (featuredProperties.length === 0) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "No featured properties found for today.",
          data: featuredProperties,
        });
    }

    const result = await Promise.all(
      featuredProperties.map(async (property) => {
        const category = await Category.findById(property.category);

        return {
          ...property.toObject(),
          category: category ? category.name : null,
        };
      })
    );

    return res.status(200).json({
      status: 200,
      message: "get all",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// add to favourite controller
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
      success: false,
      message: "Cant fetch Favourite Properties",
    });
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
