const express = require('express');
const router = express.Router();
const { generateTaxFormPdf } = require('../controller/pdfController');

router.post('/generate-tax-form', generateTaxFormPdf);

module.exports = router;