const booking = require('../model/bookingModel');

const bookProperty = async (req, res) => {
    try {
        const { propertyId, userId, checkIn, checkOut, guests, totalAmount } = req.body;

        const newBooking = new booking({
            propertyId,
            userId,
            checkInDate:checkIn,
            checkOutDate:checkOut,
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

module.exports ={
    bookProperty
}