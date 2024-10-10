const express = require('express')
const {uploadToS3}=require('../comman/multerConfig');
const {addProperty}=require('../controller/submitPropertyController');

const router = express.Router();

router.post('/add', addProperty);

module.exports = router;