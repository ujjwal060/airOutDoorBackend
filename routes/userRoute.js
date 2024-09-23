const express = require('express');
const {
    signupUser,
    userVerify,
    resendCode,
    setPassword,
    loginUser,
    forgate,
    changePassword } = require('../controller/userController');
const router = express.Router();


router.post('/signup', signupUser);
router.post('/verifyCode', userVerify);
router.post('/setPassword', setPassword);
router.post('/login', loginUser);
router.post('/sendOTP', resendCode);
router.post('/forgate', forgate);
router.put('/changePassword/:id', changePassword);


module.exports = router;