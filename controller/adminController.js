const jwt = require('jsonwebtoken');
const Vendor = require('../model/vendorModel');
const sendEmail=require('../comman/sendEmail')

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = 'admin@airoutdoor.com';
    const adminPassword = 'admin';

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      message: 'Login successful',
      token,
      data: { email: adminEmail, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const vendorApprove = async (req, res) => {
  const { vendorId,status } = req.body;
  try {
    const vendor = await Vendor.findOne({vendorId:vendorId});

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (status === 'approved') {
      vendor.isApproved = true;
      vendor.status = 'approved';
    } else if (status === 'rejected') {
      vendor.isApproved = false;
      vendor.status = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
    }

    await vendor.save();

    const subject = `Vendor Account ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const message = status === 'approved'
      ? `Your vendor account has been approved. You can now log in using your credentials.\n\nEmail: ${vendor.email}`
      : `Your vendor account has been rejected. Please contact support for further information.`;

    await sendEmail(vendor.email, subject, message);

    res.status(200).json({ message: `Vendor ${status} and email sent` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

const allVendor=async(req,res)=>{
  try {
    const { search, page, limit } = req.body;

    const pageNumber = page || 1;
    const pageSize = limit || 10;

    const aggregation = [];

    if (search) {
      aggregation.push({
        $match: { name: { $regex: search, $options: 'i' } }
      });
    }

    aggregation.push({
      $facet: {
        data: [
          { $skip: (pageNumber - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    });

    const results = await Vendor.aggregate(aggregation);

    const vendors = results[0].data;
    const totalUsers = results[0].totalCount[0] ? results[0].totalCount[0].count : 0;
    const totalPages = Math.ceil(totalUsers / pageSize);

    res.json({
      vendors,
      totalUsers,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { login,vendorApprove,allVendor }