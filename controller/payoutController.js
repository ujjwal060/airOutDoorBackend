const bookingModel = require('../model/bookingModel');
const payoutModel = require('../model/payoutModel');
const vendorModel = require('../model/vendorModel');

const calculateAndInitializePayouts = async () => {
    try {
        const aggregation = []

        aggregation.push({
            $match: {
                totalAmount: { $regex: /^\$\d+(\.\d+)?$/ }
            }
        });
        aggregation.push({
            $addFields: {
                totalAmount: { $trim: { input: "$totalAmount" } } // Optional, to remove any spaces
            }
        });
        aggregation.push({
            $addFields: {
                totalAmountNumeric: { $toDouble: { $substrBytes: ["$totalAmount", 1, { $strLenBytes: "$totalAmount" }] } }
            }
        });
        aggregation.push({
            $match: {
                vendorId: { $ne: null }
            }
        });
        aggregation.push({
            $group: {
                _id: "$vendorId",
                totalAmount: { $sum: "$totalAmountNumeric" },
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
                    payouts: 1,
                    remainingAmount: 1,
                    vendorName: { $ifNull: ['$vendorInfo.name', 'Unknown Vendor'] },
                    vendorContact: { $ifNull: ['$vendorInfo.phone', 'N/A'] }
                }
            }
        ]);
        res.status(200).json({
            status: 200,
            data: allPay
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
}



module.exports = { calculateAndInitializePayouts, getAllPayout };