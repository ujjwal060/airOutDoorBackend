const express = require('express');
const {verufyToken}=require('../middleware/verifyToken')
const {createVendor,login,sendEmailOTP,resetPassword,editProfile} = require('../controller/vendorController');
const upload=require('../comman/multerConfig')
const router = express.Router();


router.post('/sigup',upload.single('profileImage'), createVendor);
router.post('/login', login);
router.post('/sendOTP', sendEmailOTP);
router.post('/forgate', resetPassword);
router.put('/profile/:id',verufyToken, upload.single('profileImage'), editProfile);



module.exports = router;