const express = require('express');
const router = express.Router();
const {sendNotification,getUserNotification}=require('../controller/notificationController');

router.post('/send',sendNotification);
router.post('/get',getUserNotification);


module.exports = router;