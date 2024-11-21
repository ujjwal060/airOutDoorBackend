const express = require('express')
const {uploadToS3}=require('../comman/multerConfig');
const {addProperty,getProperty}=require('../controller/submitPropertyController');
const {deleteProperty}=require('../controller/propertyController');

const router = express.Router();

router.post('/add',uploadToS3, addProperty);
router.get('/getProperty',getProperty)
router.delete('/delete-property/:id', deleteProperty);

module.exports = router;