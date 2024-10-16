const express = require('express');

const {addFav, getFav,deleteFav}=require('../controller/favoriteController');
const {verifyToken }=require('../middleware/verifyToken');
const router = express.Router();

router.post('/addFav', addFav);
router.get('/getFav/:userId', getFav);
router.delete('/deleteFav' , deleteFav);

module.exports = router;