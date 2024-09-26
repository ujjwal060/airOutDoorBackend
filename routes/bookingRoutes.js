// /routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controller/bookingController');

router.get('/get', bookingController.getAllBookings); // Get all bookings
router.post('/post', bookingController.createBooking); // Create a booking
router.put('/put/:id', bookingController.updateBooking); // Update a booking by ID
router.delete('/delete/:id', bookingController.deleteBooking); // Delete a booking by ID

module.exports = router;
