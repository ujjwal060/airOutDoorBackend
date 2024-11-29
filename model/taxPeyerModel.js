const mongoose = require('mongoose');

const TaxDocuments = new mongoose.Schema({
    vendorId: {
        type:String,
        ref: 'Vendor',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    pdfLink:{
        type:String,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('taxpayerDocuments', TaxDocuments);