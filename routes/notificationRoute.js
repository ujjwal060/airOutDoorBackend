const express = require('express');
const router = express.Router();
const {sendNotification}=require('../controller/notificationController');

router.post('/send',sendNotification);


module.exports = router;