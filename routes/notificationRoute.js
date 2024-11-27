const express = require('express');
const router = express.Router();
const {sendNotification,getUserNotification,notificationReadByUser,getVendorNotification,notificationReadByVendor}=require('../controller/notificationController');

router.post('/send',sendNotification);
router.post('/get',getUserNotification);
router.patch('/read/:id',notificationReadByUser);
router.post('/getVendor',getVendorNotification);
router.patch('/readVendor/:id',notificationReadByVendor);


module.exports = router;