const express = require('express')
const { getProperties, addProperty, updateProperty, deleteProperty } = require('../controller/propertyController')
// const upload=require('../comman/multerConfig');

const router = express.Router()

router.get('/get', getProperties)
// router.post('/post', upload.single('image'), addProperty)
// router.put('/update/:id', upload.single('image'), updateProperty)
router.delete('/delete/:id', deleteProperty)

module.exports = router
