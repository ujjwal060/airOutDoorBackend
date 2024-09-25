const express = require('express')
const { getProperties, addProperty, updateProperty, deleteProperty } = require('../controller/propertyController')
const {uploadToS3}=require('../comman/multerConfig');


const router = express.Router()

router.get('/get', getProperties)
router.post('/post', uploadToS3, addProperty)
router.put('/update/:id', uploadToS3, updateProperty)
router.delete('/delete/:id', deleteProperty)

module.exports = router
