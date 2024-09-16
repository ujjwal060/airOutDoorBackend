const express = require('express');
const {login,vendorApprove} = require('../controller/adminController');


const router = express.Router();

router.post('/login', login);
router.post('/verify/:vendorId', vendorApprove);

module.exports = router;