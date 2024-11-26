const express = require('express');
const router = express.Router();
const {sendNotification,getUserNotification,notificationReadByUser}=require('../controller/notificationController');

router.post('/send',sendNotification);
router.post('/get',getUserNotification);
router.patch('/read/:id',notificationReadByUser)


module.exports = router;