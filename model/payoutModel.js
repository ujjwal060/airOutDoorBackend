const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
    {
        vendorId: { type: String, ref: 'Vendor' },
        payouts: [
            {
                amountPaid: { type: Number, required: true },
                paymentDate: { type: Date, default: Date.now },
            }
        ],
        remainingAmount: { type: Number, required: true }
    }
);

module.exports = mongoose.model('Payouts', payoutSchema);
