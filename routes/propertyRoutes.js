const express = require('express')
const { getProperties, addProperty, updateProperty, deleteProperty,getfeaturedProperty, favouriteproperty, getFavoriteProperty } = require('../controller/propertyController')
const {uploadToS3}=require('../comman/multerConfig');


const router = express.Router()

router.get('/get/:vendorId', getProperties);
router.post('/post',uploadToS3, addProperty);
router.put('/update/:id', uploadToS3, updateProperty);
router.delete('/delete/:id', deleteProperty);
router.post('/favorite', favouriteproperty);
router.get('/getfavorite', getFavoriteProperty);
router.post('/featured',getfeaturedProperty);

module.exports = router
