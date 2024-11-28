const express = require('express');
const router = express.Router();
const { generateTaxFormPdf,getTaxFormByVendorId,getTaxForm } = require('../controller/pdfController');
const {uploadToS3}=require('../comman/multerConfig');

router.post('/generate-tax-form',uploadToS3, generateTaxFormPdf);
router.get('/get/:vendorId',getTaxFormByVendorId);
router.get('/get',getTaxForm);

module.exports = router;