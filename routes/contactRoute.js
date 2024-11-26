
const express = require('express');
const {postContact, getAllContactUs, markContactRead} = require('../controller/contactController');
const router = express.Router();

// router.get('/getreviews', getReviews);
// router.delete('/delete/:id', deleteReview);
router.post('/post', postContact);
router.get('/getContactUs',getAllContactUs)
router.put('/markRead/:id',markContactRead)

module.exports = router;
