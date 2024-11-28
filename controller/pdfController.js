const taxpayModel = require('../model/taxPeyerModel');

const generateTaxFormPdf = async (req, res) => {
  try {

    const pdfLink = req.fileLocations[0];

    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).send('Vendor ID is required.');
    }

    const newTaxDocument = new taxpayModel({
      vendorId: vendorId,
      date: new Date(),
      pdfLink: pdfLink,
    });

    await newTaxDocument.save();

    return res.status(200).send({
      message: 'PDF uploaded successfully',
      status:200
    });
  } catch (error) {
    return res.status(500).send('Failed to upload PDF');
  }
};

const getTaxFormByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).send('Vendor ID is required.');
    }

    const taxDocument = await taxpayModel.findOne({ vendorId: vendorId });

    if (!taxDocument) {
      return res.status(404).send('Tax document not found for this vendor.');
    }

    return res.status(200).send({
      message: 'Tax document retrieved successfully',
      status: 200,
      data: taxDocument
    });
  } catch (error) {
    return res.status(500).send('Failed to retrieve tax document.');
  }
};

module.exports = { generateTaxFormPdf,getTaxFormByVendorId };