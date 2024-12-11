const express = require('express');
const router = express.Router();
const {getAllPayout,getPayouthistoryByVendor,cashoutRequest, approvePayout}=require('../controller/payoutController');

router.get('/getAll', getAllPayout);
router.get('/getVendorPay/:vendorId', getPayouthistoryByVendor);
router.post('/cashoutRequest',cashoutRequest);
router.post('/approvePayout',approvePayout);


module.exports = router;