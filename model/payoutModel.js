const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
    {
        vendorId: { type: String, ref: 'Vendor' },
        remainingAmount: { type: Number, required: true },
        cashoutRequests: [
            {
                amountRequested: { type: Number, required: true },
                requestDate: { type: Date, default: Date.now },
                stripeAccountId: { type: String, },
                status: {
                    type: String,
                    enum: ['pending', 'paid', 'rejected'],
                    default: 'pending',
                },
                paymentDate: { type: Date },
            }
        ]
    }
);

module.exports = mongoose.model('Payouts', payoutSchema);