const express = require('express');
const {bookProperty,getBookingByUser,getBooking,getAllBookings,payment,cancelBooking}=require('../controller/bookingController');

const router = express.Router();

router.post('/book',bookProperty);
router.get('/book/:userId',getBookingByUser);
router.post('/getBook',getBooking);
router.get('/getBooking',getAllBookings);
router.post('/cancelBooking/:id',cancelBooking);
router.post('/payment',payment);


module.exports = router;