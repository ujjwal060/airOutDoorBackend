const express = require('express');
const router = express.Router();
const { generateTaxFormPdf,getTaxFormByVendorId } = require('../controller/pdfController');
const {uploadToS3}=require('../comman/multerConfig');

router.post('/generate-tax-form',uploadToS3, generateTaxFormPdf);
router.get('/get/:vendorId',getTaxFormByVendorId);

module.exports = router;