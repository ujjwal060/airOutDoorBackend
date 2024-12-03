const Property = require("../model/propertyModel");
const Category = require("../model/catogriesModel");

const getProperties = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const properties = await Property.find({ vendorId })
      .populate({
        path: 'reviews', // Populate the reviews field
        populate: { path: 'user', select: 'fullName imageUrl' }, // Populate user details in reviews
      });

    res.status(200).json(properties);
  } catch (err) {
    console.error("Error fetching properties:", err);
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

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const deletedProperty = await Property.findByIdAndDelete(propertyId);
    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.json({
      message: "Property deleted successfully",
      updatedProperty: deletedProperty,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting property" });
  }
};

const getfeaturedProperty = async (req, res) => {
  try {
    const { categoryId, lat, lng } = req.body.requestPayload;

    const RADIUS_OF_EARTH = 6371; // Radius of Earth in km
    const MAX_DISTANCE = 5; // Maximum distance in km

    let aggregation = [];

    // Filter by category ID
    if (categoryId) {
      aggregation.push({
        $match: { category: categoryId },
      });
    }

    // Filter by location (lat/lng)
    if (lat && lng) {
      aggregation.push({
        $addFields: {
          distance: {
            $multiply: [
              RADIUS_OF_EARTH,
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $radians: lat } },
                        { $sin: { $radians: "$location.latitude" } },
                      ],
                    },
                    {
                      $multiply: [
                        { $cos: { $radians: lat } },
                        { $cos: { $radians: "$location.latitude" } },
                        { $cos: { $radians: { $subtract: [lng, "$location.longitude"] } } },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      });

      aggregation.push({
        $match: {
          distance: { $lte: MAX_DISTANCE },
        },
      });
    }

    // Populate category details
    aggregation.push({
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    });

    aggregation.push({
      $addFields: {
        category: { $arrayElemAt: ["$categoryDetails.name", 0] },
      },
    });

    // Populate reviews and users in reviews
    aggregation.push({
      $lookup: {
        from: "reviews",
        localField: "reviews",
        foreignField: "_id",
        as: "reviewDetails",
      },
    });

    aggregation.push({
      $lookup: {
        from: "users",
        localField: "reviewDetails.user",
        foreignField: "_id",
        as: "userDetails",
      },
    });

    aggregation.push({
      $addFields: {
        reviews: {
          $map: {
            input: "$reviewDetails",
            as: "review",
            in: {
              rating: "$$review.rating",
              review: "$$review.review",
              createdAt: "$$review.createdAt",
              user: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$userDetails",
                      as: "user",
                      cond: { $eq: ["$$user._id", "$$review.user"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    });

    // Cleanup unwanted fields
    aggregation.push({
      $project: {
        categoryDetails: 0,
        reviewDetails: 0,
        userDetails: 0,
      },
    });

    const featuredProperties = await Property.aggregate(aggregation);

    return res.status(200).json({
      status: 200,
      message: "Successfully fetched featured properties",
      data: featuredProperties,
    });
  } catch (error) {
    console.error("Error fetching featured properties:", error);
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
