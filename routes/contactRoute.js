
const express = require('express');
const {postContact} = require('../controller/contactController');
const router = express.Router();

// router.get('/getreviews', getReviews);
// router.delete('/delete/:id', deleteReview);
router.post('/post', postContact);

module.exports = router;
