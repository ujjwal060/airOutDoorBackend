const express = require('express');
const {
    signupUser,
    userVerify,
    resendCode,
    setPassword,
    loginUser,
    forgate,
    resetPassword,
    changePassword } = require('../controller/userController');
const router = express.Router();


router.post('/sigup', signupUser);
router.post('/verifyCode', userVerify);
router.post('/setPassword', setPassword);
router.post('/login', loginUser);
router.post('/sendOTP', resendCode);
router.post('/forgate', forgate);
router.post('/reset', resetPassword);
router.put('/changePassword/:id', changePassword);


module.exports = router;