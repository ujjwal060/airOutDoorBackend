const express = require('express');
const {login,vendorApprove,allVendor} = require('../controller/adminController');


const router = express.Router();

router.post('/login', login);
router.post('/verify/', vendorApprove);
router.post('/getVendor/', allVendor);

module.exports = router;