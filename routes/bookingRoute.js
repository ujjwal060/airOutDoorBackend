const express = require('express');
const {bookProperty}=require('../controller/bookingController');

const router = express.Router();

router.post('/book',bookProperty);

module.exports = router;