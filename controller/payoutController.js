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

const getPayouthistoryByVendor=async(req,res)=>{
    const { vendorId } = req.params;

    try {
        const payoutRecord = await payoutModel.findOne({ vendorId });
    
        if (!payoutRecord) {
          return res.status(404).json({ message: 'Payout record not found for this vendor' });
        }
    
        res.status(200).json({
          payouts: payoutRecord.payouts,
          remainingAmount: payoutRecord.remainingAmount,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching payouts' });
      }
}

const cashoutRequest=async(req,res)=>{
    const { vendorId, amountRequested, stripeAccountId } = req.body;

  try {
    const payout = await payoutModel.findOne({ vendorId });

    if (amountRequested <= 0 || amountRequested > payout.remainingAmount) {
      return res.status(400).json({ success: false, message: 'Invalid cashout amount' });
    }

    payout.remainingAmount -= amountRequested;

    payout.cashoutRequests.push({ amountRequested, stripeAccountId });

    await payout.save();

    res.json({ success: true, message: 'Cashout request successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message:error.message});
  }
}

module.exports = { calculateAndInitializePayouts, getAllPayout,getPayouthistoryByVendor,cashoutRequest };