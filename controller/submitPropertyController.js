const submitProperty = require('../model/submitPropertyModel');

const addProperty = async (req, res) => {
    try {
        // Extracting data from req.body
        const {
            propery_nickname,       // Typo corrected from propertyNickname
            category,
            property_description,
            instant_booking,
            priceRange,
            images,
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
            checkOut
        } = req.body;

        // Creating a new listing object with parsed and structured data
        const newListing = new submitProperty({
            propertyNickname: propery_nickname,
            category,
            propertyDescription: property_description,
            instantBooking: instant_booking,
            priceRange, // Already structured as an object
            images, // Assuming the images are sent as an array
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
                longitude
            },
            calendar: {
                checkIn,
                checkOut
            }
        });

        // Saving the new listing to the database
        const savedListing = await newListing.save();
        res.status(200).json(savedListing);

    } catch (error) {
        // Sending error response
        res.status(400).json({ message: error.message });
    }
};

module.exports =
{
    addProperty
}