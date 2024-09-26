
const Booking = require('../model/bookingModel');

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

// Create a new booking
exports.createBooking = async (req, res) => {
  const { checkIn, checkOut, guests, camper } = req.body;
  const pricing = calculatePricing(checkIn, checkOut); // Assuming pricing calculation here

  const newBooking = new Booking({ checkIn, checkOut, guests, camper, pricing });

  try {
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error });
  }
};

// Update a booking by ID
exports.updateBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking', error });
  }
};

// Delete a booking by ID
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    await Booking.findByIdAndDelete(id);
    res.status(204).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error });
  }
};

// Helper function to calculate pricing
const calculatePricing = (checkIn, checkOut) => {
  const pricingPerDay = 100; // Example static pricing
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * pricingPerDay : 0;
};
