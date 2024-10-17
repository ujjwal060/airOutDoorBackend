const express = require('express');
const {bookProperty,getBookingByUser,getBooking,getAllBookings}=require('../controller/bookingController');

const router = express.Router();

router.post('/book',bookProperty);
router.get('/book/:userId',getBookingByUser);
router.get('/getBook/:vendorId',getBooking);
router.get('/getBooking',getAllBookings);


module.exports = router;