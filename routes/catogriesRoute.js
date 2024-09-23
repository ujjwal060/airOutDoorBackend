const express = require('express');
const {addCatogries,getCatogry, deleteCatogry}=require('../controller/catogries');
const upload=require('../comman/multerConfig');

const router = express.Router();

router.post('/add',upload.single('image'),addCatogries)
router.get('/get',getCatogry);
router.delete('/delete',deleteCatogry);

module.exports = router;