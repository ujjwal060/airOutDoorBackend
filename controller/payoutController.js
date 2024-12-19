const bookingModel = require('../model/bookingModel');
const payoutModel = require('../model/payoutModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const calculateAndInitializePayouts = async () => {
    try {
        const aggregation = []
        aggregation.push({
            $match: {
                vendorId: { $ne: null },
                totalAmount: { $type: "string" }
            }
        });
        aggregation.push({
            $addFields: {
                totalAmountNumeric: { $toDouble: "$paidAmount" }
            }
        });
        aggregation.push({
            $group: {
                _id: "$vendorId",
                totalAmount: { $sum: "$totalAmountNumeric" }
            }
        });

        const vendorBookings = await bookingModel.aggregate(aggregation);

        for (const vendor of vendorBookings) {
            const { _id: vendorId, totalAmount } = vendor;

            let payout = await payoutModel.findOne({ vendorId });

            if (!payout) {
                payout = new payoutModel({ vendorId, remainingAmount: totalAmount, payouts: [] });
            } else {
                payout.remainingAmount = totalAmount;
            }

            await payout.save();
        }

    } catch (error) {
        console.error("Error calculating and initializing payouts:", error);
    }
};

const getAllPayout = async (req, res) => {
    try {
        const allPay = await payoutModel.aggregate([
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'vendorId',
                    foreignField: 'vendorId',
                    as: 'vendorInfo'
                }
            },
            {
                $unwind: { path: '$vendorInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 1,
                    vendorId: 1,
                    remainingAmount: 1,
                    cashoutRequests: 1,
                    vendorName: { $ifNull: ['$vendorInfo.name', 'Unknown Vendor'] },
                    vendorContact: { $ifNull: ['$vendorInfo.phone', 'N/A'] }
                }
            }
        ]);

        const totalExpenseResult = await bookingModel.aggregate([
            {
                $addFields: {
                    totalAmountNumeric: { $toDouble: '$totalAmount' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalExpense: {
                        $sum: '$totalAmountNumeric'
                    }
                }
            }
        ]);

        const totalExpense = totalExpenseResult[0]?.totalExpense || 0;
        res.status(200).json({
            status: 200,
            data: { allPay, totalExpense }
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
}

const getPayouthistoryByVendor = async (req, res) => {
    const { vendorId } = req.params;

    try {
        const payoutRecord = await payoutModel.findOne({ vendorId });

        if (!payoutRecord) {
            return res.status(404).json({ message: 'Payout record not found for this vendor' });
        }

        res.status(200).json({
            cashoutRequests: payoutRecord.cashoutRequests,
            remainingAmount: payoutRecord.remainingAmount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching payouts' });
    }
}

const cashoutRequest = async (req, res) => {
    const { vendorId, amountRequested, stripeAccountId } = req.body;

    try {
        const payout = await payoutModel.findOne({ vendorId });

        if (!payout) {
            return res.status(404).json({ success: false, message: 'Payout record not found' });
        }

        if (amountRequested <= 0 || amountRequested > payout.remainingAmount) {
            return res.status(400).json({ success: false, message: 'Invalid cashout amount' });
        }

        const newCashoutRequest = {
            amountRequested,
            stripeAccountId,
            requestDate: new Date(),
            status: 'pending',
        };

        payout.cashoutRequests.push(newCashoutRequest);

        await payout.save();

        res.json({
            success: true,
            message: 'Cashout request successful',
            cashoutRequest: newCashoutRequest,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const approvePayout = async (req, res) => {
    const { payoutRequestId, vendorId, amountRequested } = req.body;

    try {
        const payout = await payoutModel.findOne({ 'cashoutRequests._id': payoutRequestId, vendorId });

        if (!payout) {
            return res.status(404).json({ message: 'Payout request not found' });
        }

        const payoutRequest = payout.cashoutRequests.id(payoutRequestId);

        if (payoutRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Payout request has already been processed' });
        }

        const transfer = await stripe.transfers.create({
            amount: amountRequested * 100,
            currency: 'usd',
            destination: payoutRequest.stripeAccountId,
            description: `Payout for Vendor ${vendorId}`,
        });

        payoutRequest.status = 'paid';
        payoutRequest.paymentDate = new Date();

        await payout.save();

        res.status(200).json({ message: 'Payout approved and payment sent', transfer });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payout', error: error.message });
    }
};

module.exports = { calculateAndInitializePayouts, getAllPayout, getPayouthistoryByVendor, cashoutRequest, approvePayout };