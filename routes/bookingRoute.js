const express = require('express');
const {bookProperty,getBookingByUser}=require('../controller/bookingController');

const router = express.Router();

router.post('/book',bookProperty);
router.get('/book/:userId',getBookingByUser);

module.exports = router;