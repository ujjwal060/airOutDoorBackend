const express = require('express');
const {verufyToken}=require('../middleware/verifyToken')
const {createVendor,login,sendEmailOTP,resetPassword,editProfile,changePassword,verifyOTP} = require('../controller/vendorController');
const {uploadToS3}=require('../comman/multerConfig');
const Vendor = require('../model/vendorModel');
const router = express.Router();


router.post('/signup',uploadToS3, createVendor);
router.post('/login', login);
router.post('/sendOTP', sendEmailOTP);
router.post('/verifyOTP', verifyOTP);
router.post('/forgate', resetPassword);
router.put('/profile/:id',verufyToken, uploadToS3, editProfile);
router.put('/changePassword/:id',changePassword);

router.get('/vendor/:vendorId', async (req, res) => {
    const { vendorId } = req.params;
    try {
        console.log(`Received request for vendor ID: ${vendorId}`); // Log the vendor ID
        const vendor = await Vendor.findOne({ vendorId });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (error) {
        console.error('Error fetching vendor:', error.message); // Log the error message
        res.status(500).json({ error: 'Server error', details: error.message }); // Include details in the response
    }
});

module.exports = router;


module.exports = router;