const bookingModel = require("../model/bookingModel");
const payoutModel = require("../model/payoutModel");
const vendorModel = require("../model/vendorModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");

const calculateAndInitializePayouts = async () => {
  try {
    const aggregation = [
      {
        $match: {
          vendorId: { $ne: null },
          totalAmount: { $type: "string" },
        },
      },
      {
        $addFields: {
          totalAmountNumeric: { $toDouble: "$totalAmount" },
        },
      },
      {
        $group: {
          _id: "$vendorId",
          totalAmount: { $sum: "$totalAmountNumeric" },
        },
      },
    ];

    const vendorBookings = await bookingModel.aggregate(aggregation);

    for (const vendor of vendorBookings) {
      const { _id: vendorId, totalAmount } = vendor;

      const payout = await payoutModel.findOne({ vendorId });
      let totalPaid = 0;

      if (payout) {
        totalPaid = payout.cashoutRequests
          .filter((request) => request.status === "paid")
          .reduce((sum, request) => sum + request.amountRequested, 0);
      }

      const remainingAmount = totalAmount - totalPaid;

      if (!payout) {
        const newPayout = new payoutModel({
          vendorId,
          remainingAmount,
          payouts: [],
        });
        await newPayout.save();
      } else {
        payout.remainingAmount = remainingAmount;
        await payout.save();
      }
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
          from: "vendors",
          localField: "vendorId",
          foreignField: "vendorId",
          as: "vendorInfo",
        },
      },
      {
        $unwind: { path: "$vendorInfo", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          vendorId: 1,
          remainingAmount: 1,
          cashoutRequests: 1,
          vendorName: { $ifNull: ["$vendorInfo.name", "Unknown Vendor"] },
          vendorContact: { $ifNull: ["$vendorInfo.phone", "N/A"] },
        },
      },
    ]);

    const totalExpenseResult = await bookingModel.aggregate([
      {
        $addFields: {
          totalAmountNumeric: { $toDouble: "$totalAmount" },
        },
      },
      {
        $group: {
          _id: null,
          totalExpense: {
            $sum: "$totalAmountNumeric",
          },
        },
      },
    ]);

    const totalExpense = totalExpenseResult[0]?.totalExpense || 0;
    res.status(200).json({
      status: 200,
      data: { allPay, totalExpense },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

const getPayouthistoryByVendor = async (req, res) => {
  const { vendorId } = req.params;

  try {
    const payoutRecord = await payoutModel.findOne({ vendorId });

    if (!payoutRecord) {
      return res
        .status(404)
        .json({ message: "Payout record not found for this vendor" });
    }

}

const cashoutRequest = async (req, res) => {
    const { vendorId, amountRequested } = req.body;

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
            requestDate: new Date(),
            status: 'pending',
        };


    res.status(200).json({
      cashoutRequests: payoutRecord.cashoutRequests,
      remainingAmount: payoutRecord.remainingAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching payouts" });
  }
};


const cashoutRequest = async (req, res) => {
  const { vendorId, swiftCode, bankName, amountRequested, stripeAccountNo } =
    req.body;

  try {
    const payout = await payoutModel.findOne({ vendorId });

    if (!payout) {
      return res
        .status(404)
        .json({ success: false, message: "Payout record not found" });
    }

    if (amountRequested <= 0 || amountRequested > payout.remainingAmount) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cashout amount" });
    }

    const newCashoutRequest = {
      stripeAccountNo,
      swiftCode,
      bankName,
      amountRequested,
      status: "pending",
    };

    payout.cashoutRequests.push(newCashoutRequest);

    await payout.save();

    res.json({
      success: true,
      message: "Cashout request successful",
      cashoutRequest: newCashoutRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approvePayout = async (req, res) => {
  const { payoutRequestId } = req.body;

  try {
    const payout = await payoutModel.findOneAndUpdate(
      {
        "cashoutRequests._id": new mongoose.Types.ObjectId(payoutRequestId),
        "cashoutRequests.status": "pending",
      },
      {
        $set: {
          "cashoutRequests.$.status": "paid",
          "cashoutRequests.$.paymentDate": new Date(),
        }
      }
    );

    if (!payout) {
      return res.status(404).json({ message: "Payout request not found or already processed" });
    }

    const payoutRequest = payout.cashoutRequests[0];

    await calculateAndInitializePayouts();
    
    res.status(200).json({
      message: "Payout approved and payment sent successfully",
      remainingAmount: payout.remainingAmount,
      payoutRequest,
    });

  } catch (error) {
    console.error("Error processing payout:", error);
    res.status(500).json({
      message: "Error processing payout",
      error: error.message,
    });
  }
};

module.exports = {
  calculateAndInitializePayouts,
  getAllPayout,
  getPayouthistoryByVendor,
  cashoutRequest,
  approvePayout,
};
