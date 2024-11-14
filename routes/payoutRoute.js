const express = require('express');
const router = express.Router();
const {getAllPayout}=require('../controller/payoutController');

router.get('/getAll', getAllPayout);

module.exports = router;