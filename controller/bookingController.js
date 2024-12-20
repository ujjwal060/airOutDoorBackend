const booking = require("../model/bookingModel");
const property = require("../model/propertyModel");
const userModel = require("../model/userModel");
const Review = require("../model/reviewModel");
const mongoose = require('mongoose');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const bookProperty = async (req, res) => {
  try {
    const {
      propertyId,
      userId,
      vendorId,
      checkIn,
      guestDetails,
      checkOut,
      guests,
      totalAmount,
    } = req.body;

    const cancellation = await property
      .findById(propertyId)
      .select("cancellationCharge");
    console.log(cancellation);

    const newBooking = new booking({
      propertyId,
      vendorId,
      userId,
      cancellationAmount: cancellation.cancellationCharge,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      guestDetails,
      totalAmount,
      bookingStatus: "pending",
    });

    // updating review
    const savedBooking = await newBooking.save();
    const populatedBooking = await booking
      .findById(savedBooking._id)
      .populate("propertyId");
    res
      .status(200)
      .json({ message: "Booking Successful!", savedBooking: populatedBooking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBooking = async (req, res) => {
  try {
    const { vendorId, propertyId } = req.body;

    const aggregation = [];

    aggregation.push({
      $match: { vendorId: vendorId },
    });

    if (propertyId) {
      aggregation.push({

        $match: { propertyId: new mongoose.Types.ObjectId(propertyId) }

      });
    }

    aggregation.push({
      $lookup: {
        from: "properties",
        localField: "propertyId",
        foreignField: "_id",
        pipeline: [{ $project: { propertyName: 1, _id: 0 } }],
        as: "propertyData",
      },
    });

    aggregation.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        pipeline: [{ $project: { fullName: 1, _id: 0 } }],
        as: "userData",
      },
    });

    aggregation.push({
      $addFields: {
        propertyName: { $arrayElemAt: ["$propertyData.propertyName", 0] },
      },
    });

    aggregation.push({
      $addFields: {
        userName: { $arrayElemAt: ["$userData.fullName", 0] },
      },
    });

    aggregation.push({
      $project: {
        propertyData: 0,
      },
    });
    aggregation.push({
      $project: {
        userData: 0,
      },
    });

    const bookings = await booking.aggregate(aggregation);

    if (!bookings.length) {
      return res
        .status(404)
        .json({ message: "No bookings found for this vendor." });
    }

    res.status(200).json(bookings);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred while fetching bookings." });
  }
};

const getBookingByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookings = await booking
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate("propertyId");

    if (!bookings.length) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user." });
    }

    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const propertyData = await property.findById(booking.propertyId);

        if (!propertyData) {
          return {
            ...booking._doc,
            propertyDetails: null,
            reviews: [],
          };
        }

        const userReviews = await Review.find({
          property: booking.propertyId,
          user: userId,
        }).select("rating review createdAt");

        return {
          ...booking._doc,
          propertyDetails: {
            name: propertyData.propertyName,
            images: propertyData.images,
          },
          reviews: userReviews, // User's reviews for this property
        };
      })
    );

    return res.status(200).json({
      status: 200,
      message: "Get bookings successfully.",
      data: bookingsWithDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// New function to get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await booking.find().sort({ createdAt: -1 });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found." });
    }

    const bookingsWithProperties = await Promise.all(
      bookings.map(async (booking) => {
        const propertyData = await property.findById(booking.propertyId);
        return {
          ...booking._doc,
          propertyDetails: propertyData,
        };
      })
    );

    return res.status(200).json(bookingsWithProperties);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred while fetching bookings." });
  }
};

const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const cancelChargePercent = 10;
  try {
    const bookings = await booking.findById(id);
    const propertyOfBooking=await property.findById(bookings.propertyId).select("cancellationCharge")
    const cancelChargePercent=propertyOfBooking?.cancellationCharge

    if (!bookings) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (bookings.bookingStatus === "cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled." });
    }

    let refundAmount = 0;

    if (bookings.paymentStatus === "paid") {
      if (!bookings.paymentIntentId) {
        return res
          .status(400)
          .json({ error: "Payment Intent ID is missing for refund." });
      }

      const totalAmount = parseFloat(bookings.totalAmount);
      const cancellationFee = (cancelChargePercent / 100) * totalAmount;
      refundAmount = totalAmount - cancellationFee;

      const refund = await stripe.refunds.create({
        payment_intent: bookings.paymentIntentId,
        amount: Math.round(refundAmount * 100),
      });

      bookings.paymentStatus = "refunded";
    }

    bookings.bookingStatus = "cancelled";
    await bookings.save();
console.log(refundAmount,cancelChargePercent)
    res.status(200).json({
      message: "Booking cancelled successfully.",
      cancellationFee: `${cancelChargePercent}%`,
      refundableAmount: refundAmount,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const payment = async (req, res) => {
  const { amount, token, userId, bookingId, vendorId, propertyId } = req.body;
  try {
    const user = await userModel.findById(userId).select("email");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const email = user.email;
    const customers = await stripe.customers.list({
      limit: 100,
    });

    let customer = customers.data.find(
      (cust) => cust.metadata.userId === userId
    );

    if (!customer) {
      customer = await stripe.customers.create({
        email: email,
        description: `Customer for User ID: ${userId}`,
        metadata: { userId: userId, bookingId: bookingId, vendorId: vendorId },
        source: token,
      });
    }

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: { token: token },
    });

    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100),
      currency: "usd",
      customer: customer.id,
      payment_method: paymentMethod.id,
      off_session: true,
      confirm: true,
      metadata: { userId: userId, bookingId: bookingId, vendorId: vendorId },
    });
    if (paymentIntent.status === "succeeded") {
      const propertyData = await property
        .findById(propertyId)
        .select("adminCommission");
      const commissionPercent = propertyData.adminCommission;
      const totalAmount = amount;
      const adminCommissionAmount = (commissionPercent / 100) * totalAmount;
      const vendorAmount = totalAmount - adminCommissionAmount;
      await booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "paid",
        paidAmount: amount,
        adminAmount: adminCommissionAmount.toFixed(2),
        vendorAmount: vendorAmount.toFixed(2),
        bookingStatus: "confirmed",
        paymentIntentId: paymentIntent.id,
      });

      res.json({
        status: 200,
        message: "Payment Successful",
        data: {
          amount,
          bookingId,
          paymentIntentId: paymentIntent.id,
        },
      });
    } else {
      await booking.findByIdAndDelete(bookingId);

      res.status(400).json({
        success: false,
        message: "Payment Failed.",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookProperty,
  getBooking,
  getBookingByUser,
  getAllBookings,
  payment,
  cancelBooking,
};
