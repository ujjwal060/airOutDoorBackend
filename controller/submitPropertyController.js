const submitProperty = require('../model/submitPropertyModel');

const addProperty = async (req, res) => {
    try {
        const {
            propery_nickname,
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
            checkOut
        } = req.body;

        let imageUrl = [];
        if (req.fileLocations) {
            imageUrl = req.fileLocations;
        }
        const newListing = new submitProperty({
            propertyNickname: propery_nickname,
            category,
            propertyDescription: property_description,
            instantBooking: instant_booking,
            priceRange,
            images:imageUrl,
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

        const savedListing = await newListing.save();
        res.status(200).json(savedListing);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getProperty = async (req, res) => {
    try {
        const data = await submitProperty.find();
        res.status(200).json({
            message: 'data get',
            data: data,
            status: 200
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports =
{
    addProperty,
    getProperty
}