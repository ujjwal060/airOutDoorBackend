const booking = require('../model/bookingModel');
const property = require('../model/propertyModel');
const userModel=require('../model/userModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const bookProperty = async (req, res) => {
    try {
        const { propertyId, userId, vendorId, checkIn,guestDetails, checkOut, guests, totalAmount } = req.body;

        const newBooking = new booking({
            propertyId,
            vendorId,
            userId,
            checkInDate: checkIn,
            checkOutDate: checkOut, 
            guests,guestDetails,
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
        const bookings = await booking.find({ vendorId: vendorId });

        if (!bookings.length) {
            return res.status(404).json({ message: 'No bookings found for this vendor.' });
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
const deleteBooking = async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const bookings = await booking.find({ vendorId: vendorId });

        if (!bookings.length) {
            return res.status(404).json({ message: 'No bookings found for this vendor.' });
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

                if (!propertyData) {
                    return {
                        ...booking._doc,
                        propertyDetails: null,
                    };
                }

                return {
                    ...booking._doc,
                    propertyDetails: {
                        name: propertyData.propertyName,
                        images: propertyData.images,
                    }
                };
            })
        );

        return res.status(200).json({
            status: 200,
            message: "Get bookings successfully.",
            data: bookingsWithProperties
        });
    }catch (error) {
        return res.status(500).json({ message:error.message});
    }
}

// New function to get all bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await booking.find();

        if (!bookings.length) {
            return res.status(404).json({ message: 'No bookings found.' });
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

const payment = async (req, res) => {
    const { amount, token, userId, bookingId,vendorId } = req.body;
   
    try {
        const user = await userModel.findById(userId).select('email');
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }
        const email = user.email
        const customers = await stripe.customers.list({
            limit: 100,
        });

        let customer = customers.data.find(cust => cust.metadata.userId === userId);

        if (!customer) {
            customer = await stripe.customers.create({
                email: email,
                description: `Customer for User ID: ${userId}`,
                metadata: { userId: userId, bookingId: bookingId, vendorId: vendorId },
                source: token,
            });
        }

        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: { token: token },
        });

        await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(amount) * 100),
            currency: 'usd',
            customer: customer.id,
            payment_method: paymentMethod.id,
            off_session: true,
            confirm: true,
            metadata: { userId: userId, bookingId: bookingId, vendorId: vendorId },
        });

        if (paymentIntent.status === 'succeeded') {
            await booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'paid',
                paymentIntentId: paymentIntent.id,
            });

            res.json({
                status: 200,
                message: "Payment Successful",
                data: {
                    amount,
                    bookingId,
                    paymentIntentId: paymentIntent.id
                }
            });
        } else {
            await booking.findByIdAndDelete(bookingId);

            res.status(400).json({
                success: false,
                message: "Payment Failed."
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    bookProperty,
    getBooking,
    getBookingByUser,
    getAllBookings,
    payment
}
