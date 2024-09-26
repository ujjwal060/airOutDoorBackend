const express = require('express');
const {login,vendorApprove,allVendor,allProoerty,allUser} = require('../controller/adminController');


const router = express.Router();

router.post('/login', login);
router.post('/verify/', vendorApprove);
router.post('/getVendor/', allVendor);
router.post('/allProoerty',allProoerty)
router.post('/allUser',allUser)


module.exports = router;