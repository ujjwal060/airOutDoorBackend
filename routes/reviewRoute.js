
const express = require('express');
const { getReviews, deleteReview,addReview  } = require('../controller/reviewController');
const router = express.Router();

router.get('/getreviews', getReviews);
router.delete('/delete/:id', deleteReview);
router.post('/addreview', addReview);

module.exports = router;
