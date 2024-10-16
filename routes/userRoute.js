const express = require('express');
const {
    signupUser,
    userVerify,
    resendCode,
    setPassword,
    loginUser,
    forgate,
    changePassword,
    getUser,
    updateProfile } = require('../controller/userController');
const router = express.Router();
const {uploadToS3}=require('../comman/multerConfig');



router.post('/signup', signupUser);
router.post('/verifyCode', userVerify);
router.post('/setPassword', setPassword);
router.post('/login', loginUser);
router.post('/sendOTP', resendCode);
router.post('/forgate', forgate);
router.put('/changePassword/:userId', changePassword);
router.get('/getUser/:userId',getUser);
router.put('/update/:userid',uploadToS3,updateProfile)


module.exports = router;