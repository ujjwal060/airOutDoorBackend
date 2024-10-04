const express = require('express');
const {bookProperty,getBookingByUser,getBooking}=require('../controller/bookingController');

const router = express.Router();

router.post('/book',bookProperty);
router.get('/book/:userId',getBookingByUser);
router.get('/getBook/:vendorId',getBookingByUser);


module.exports = router;