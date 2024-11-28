const taxpayModel = require('../model/taxPeyerModel');
const vendorModel = require('../model/vendorModel');

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
      status: 200
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

    const taxDocument = await taxpayModel.find({ vendorId: vendorId });

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

const getTaxForm = async (req, res) => {
  try {
    const taxDocuments = await taxpayModel.find();

    if (!taxDocuments || taxDocuments.length === 0) {
      return res.status(404).send('No tax documents found.');
    }

    const result = [];
    for (let doc of taxDocuments) {
      const vendor = await vendorModel.findOne({ vendorId: doc.vendorId });
      const vendorName = vendor ? vendor.name : 'Vendor not found';
      result.push({
        ...doc.toObject(),
        vendorName,
      });
    }

    return res.status(200).send({
      message: 'Tax document retrieved successfully',
      status: 200,
      data: result
    });

  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = { generateTaxFormPdf, getTaxFormByVendorId, getTaxForm };