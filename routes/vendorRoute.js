const express = require('express');
const {verufyToken}=require('../middleware/verifyToken')
const {createVendor,login,sendEmailOTP,resetPassword,editProfile,changePassword,verifyOTP} = require('../controller/vendorController');
const {uploadToS3}=require('../comman/multerConfig');
const router = express.Router();


router.post('/signup',uploadToS3, createVendor);
router.post('/login', login);
router.post('/sendOTP', sendEmailOTP);
router.post('/verifyOTP', verifyOTP);
router.post('/forgate', resetPassword);
router.put('/profile/:id',verufyToken, uploadToS3, editProfile);
router.put('/changePassword/:id',changePassword);


module.exports = router;