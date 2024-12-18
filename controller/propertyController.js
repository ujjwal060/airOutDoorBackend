const Property = require("../model/propertyModel");
const Category = require("../model/catogriesModel");

const getProperties = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const currentDate = new Date();

    const properties = await Property.find({
      vendorId,
      endDate: { $gte: currentDate },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "reviews", // Populate the reviews field
        populate: { path: "user", select: "fullName imageUrl" }, // Populate user details in reviews
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
      property_name,
      address,
      city,
      zip_code,
      state,
      country,
      latitude,
      longitude,
      checkIn,
      checkOut,
      pricePerPersonPerDay,
      disabledDates,
      customFields,
    } = req.body;
    const parsedCustomFields = JSON.parse(customFields);

    const parsedDates = JSON.parse(disabledDates);

    let imageUrl = [];
    if (req.fileLocations) {
      imageUrl = req.fileLocations;
    }
    const newListing = new Property({
      vendorId: vendorId,
      propertyNickname: property_nickname,
      category,
      propertyDescription: property_description,
      pricePerPersonPerDay:parseFloat(pricePerPersonPerDay),
      images: imageUrl,
      propertyName: property_name,
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
      disabledDates: parsedDates,
      customFields:parsedCustomFields


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

    let parsedCustomFields = property?.customFields;
    if (req?.body?.customFields) {
      parsedCustomFields = JSON.parse(req?.body?.customFields);
    }

    let parsedDisabledDates = property?.disabledDates;
    if (req?.body?.disabledDates) {
      parsedDisabledDates = JSON.parse(req?.body?.disabledDates);
    }

    let imageUrl = property.images;
    if (req.fileLocations) {
      imageUrl = req.fileLocations;
    }

    const updatedData = {
      vendorId: req.body.vendorId || property.vendorId,
      propertyNickname: req.body.property_nickname || property.propertyNickname,
      category: req.body.category || property.category,
      propertyDescription:
        req.body.property_description || property.propertyDescription,
      pricePerPersonPerDay:
        req.body.pricePerPersonPerDay !== undefined
          ? parseFloat(req.body.pricePerPersonPerDay)
          : property.pricePerPersonPerDay,
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
      disabledDates: parsedDisabledDates,
      customFields: parsedCustomFields,
    };

    // Update the property
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true } 
    );

    res.status(200).json(updatedProperty);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating property", error: error.message });
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
    const currentDate = new Date(); // Get the current date

    let aggregation = [];

    aggregation.push({
      $match: { endDate: { $gte: currentDate } },
    });

    // Filter by category ID
    if (categoryId) {
      aggregation.push({
        $match: { category: categoryId },
      });
    }

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
                        {
                          $cos: {
                            $radians: {
                              $subtract: [lng, "$location.longitude"],
                            },
                          },
                        },
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

    // Sort by newest first
    aggregation.push({
      $sort: { createdAt: -1 }, // Sort by createdAt field in descending order
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
    const currentDate = new Date();
    const favProperty = await Property.find({
      isFavorite: true,
      endDate: { $gte: currentDate },
    }).sort({ createdAt: -1 });
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

const addCommisionAndApprove = async (req, res) => {
  try {
    const { approvalPropertyId, adminCommission, dropdownValue } = req.body;

    const property = await Property.findById(approvalPropertyId);

    // Check if the property is already approved
    if (property.isApproveByAdmin) {
      return res.status(401).json({
        success: false,
        message: "Property is already Approved by the admin",
      });
    }

    // Update the specific fields
    await Property.findByIdAndUpdate(
      approvalPropertyId,
      {
        isApproveByAdmin: dropdownValue,
        adminCommission,
      },
      { new: true } // Return the updated document if needed
    );

    return res.status(200).json({
      success: true,
      message: "Property Approved and commission added successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while approving property",
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
  addCommisionAndApprove,
};
