const submitProperty = require("../model/submitPropertyModel");

const addProperty = async (req, res) => {
    console.log("Request body:", req.body);
  
    try {
      // Destructure the fields from the request body, including pricePerGroupSize and calendar fields
      const {
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
        startDate,  // This is the checkIn date from frontend
        endDate,    // This is the checkOut date from frontend
        pricePerGroupSize,
      } = req.body;
  
      // If pricePerGroupSize is a string (it might be stringified from frontend), parse it
      const parsedPricePerGroupSize = typeof pricePerGroupSize === 'string' 
        ? JSON.parse(pricePerGroupSize) 
        : pricePerGroupSize;
  
      console.log("Parsed pricePerGroupSize:", parsedPricePerGroupSize);
  
      // Handle image URLs from the uploaded files (if any)
      let imageUrl = [];
      if (req.fileLocations) {
        imageUrl = req.fileLocations;
      }
  
      // Convert startDate (checkIn) and endDate (checkOut) to availableDates with from and to properties
      const availableDates = 
        {
          from: new Date(startDate), // Convert startDate to Date object (checkIn)
          to: new Date(endDate),     // Convert endDate to Date object (checkOut)
        }
      
  
      console.log("Available Dates:", availableDates);
  
      // Create a new listing with all the required fields, including the parsed pricePerGroupSize
      const newListing = new submitProperty({
        propertyNickname: property_nickname,
        category,
        propertyDescription: property_description,
        priceRange,
        details: {
          instantBooking: instant_booking,
          acreage,
          guidedHunt: guided_hunt,
          guestLimitPerDay: guest_limit,
          lodging,
          shootingRange: shooting_range,
          optionalExtendedDetails: extended_details,
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
        calendar: {
          availableDates:{
            from:startDate,
            to:endDate
          } , // Store the availableDates array here
        },
        pricePerGroupSize: parsedPricePerGroupSize,  // Add this field to the listing
      });
  
      // Save the listing to the database
      const savedListing = await newListing.save();
      res.status(200).json(savedListing);
  
    } catch (error) {
      console.log("Error while adding property:", error);
      res.status(401).json({ message: error.message });
    }
  };
  
  

const getProperty = async (req, res) => {
  try {
    const data = await submitProperty.find();
    res.status(200).json({
      message: "data get",
      data: data,
      status: 200,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addProperty,
  getProperty,
};
