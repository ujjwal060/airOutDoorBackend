const express = require('express');
const {addCatogries,getCatogry, deleteCatogry}=require('../controller/catogries');
const {uploadToS3}=require('../comman/multerConfig');

const router = express.Router();

router.post('/add', uploadToS3, addCatogries);
router.post('/get',getCatogry);
router.delete('/delete/:id',deleteCatogry);

module.exports = router;