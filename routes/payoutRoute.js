const express = require('express');
const router = express.Router();
const {getAllPayout,getPayouthistoryByVendor}=require('../controller/payoutController');

router.get('/getAll', getAllPayout);
router.get('/getVendorPay/:vendorId', getPayouthistoryByVendor);


module.exports = router;