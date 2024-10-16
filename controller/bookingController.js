const booking = require('../model/bookingModel');
const property=require('../model/propertyModel');


const bookProperty = async (req, res) => {
    try {
        const { propertyId, userId, vendorId,checkIn, checkOut, guests, totalAmount } = req.body;

        const newBooking = new booking({
            propertyId,
            vendorId,
            userId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            guests,
            totalAmount,
            bookingStatus: 'pending',
        });

        const savedBooking = await newBooking.save();
        res.status(200).json({ message: "Booking Successful!", savedBooking });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getBooking = async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const bookings = await booking.find({ vendorId:vendorId });

        if (!bookings.length) {
            return res.status(404).json({ message: 'No bookings found for this user.' });
        }

        const bookingsWithProperties = await Promise.all(
            bookings.map(async (booking) => {
                const propertyData = await property.findById(booking.propertyId);
                return {
                    ...booking._doc,
                    propertyDetails: propertyData
                };
            })
        );

        return res.status(200).json(bookingsWithProperties);
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while fetching bookings.' });
    }
}

const getBookingByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const bookings = await booking.find({ userId });

        if (!bookings.length) {
            return res.status(404).json({ message: 'No bookings found for this user.' });
        }

        const bookingsWithProperties = await Promise.all(
            bookings.map(async (booking) => {
                const propertyData = await property.findById(booking.propertyId);
                return {
                    ...booking._doc,
                    propertyDetails: propertyData
                };
            })
        );

        return res.status(200).json(bookingsWithProperties);
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while fetching bookings.' });
    }
}
module.exports = {
    bookProperty,
    getBooking,
    getBookingByUser
}