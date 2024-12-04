const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Vendor = require("../model/vendorModel");
const sendEmail = require("../comman/sendEmail");
const Users = require("../model/userModel");

const createVendor = async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  try {
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: "This email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let nextVendorNumber = (await Vendor.countDocuments()) + 1;
    const vendorId = `V-${nextVendorNumber.toString().padStart(3, "0")}`;

    let profileImagePath = "";
    if (req.fileLocations) {
      profileImagePath = req.fileLocations[0];
    }

    const newVendor = new Vendor({
      vendorId,
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      profileImage: profileImagePath,
      status: "pending",
      isApproved: false,
    });

    await newVendor.save();

    res.status(200).json({
      message: "Vendor registration successful. Awaiting admin approval.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!vendor.isApproved) {
      return res
        .status(403)
        .json({ message: "Vendor is not approved yet", isApproved: false });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: vendor.vendorId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      vendor: {
        id: vendor.vendorId,
        name: vendor.name,
        email: vendor.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendEmailOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res
        .status(404)
        .json({ message: "Vendor not found , please check your email" });
    }

    const otp = generateOTP();
    vendor.otp = otp;
    vendor.expires = Date.now() + 15 * 60 * 1000;
    await vendor.save();

    const subject = "Password Reset OTP";
    const message = `Your OTP for resetting your password is: ${otp}. This OTP is valid for 15 minutes.`;

    await sendEmail(vendor.email, subject, message);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await Vendor.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.expires < Date.now()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    res.status(200).json({
      message: "Verification success. You can now create a password.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (Date.now() > vendor.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    vendor.password = hashedPassword;
    vendor.expires = undefined;
    await vendor.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const editProfile = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const { name, phone, address, businessInfo } = req.body;
    const profileImage = req.file ? req.file.location : null;

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { name, phone, address, businessInfo, profileImage },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      message: "Profile updated successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const vendorId = req.params.id;
    if (!oldPassword || !newPassword) {
      return res.status(400).send("Old password and new password are required");
    }
    const users = await Vendor.findById(vendorId);
    if (!users) return res.status(404).send("Vendor not found");

    const isPasswordValid = await bcrypt.compare(oldPassword, users.password);
    if (!isPasswordValid)
      return res.status(400).send("Old password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users.password = hashedPassword;

    await users.save();
    res.status(200).json({ message: "Password changed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const data = await Vendor.find();
    res.status(200).json({ message: "get all vendor", data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const data = await Users.find({ _id: { $in: userIds } }).select(
      "fullName imageUrl _id"
    );
    res.status(200).json({ message: "get all users", data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getHosts = async (req, res) => {
  try {
    const data = await Vendor.find().select("name profileImage ");
    res.status(200).json({ message: "getting all hosts", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHosts,
  createVendor,
  login,
  sendEmailOTP,
  resetPassword,
  editProfile,
  verifyOTP,
  changePassword,
  getAll,
  getUsers,
};
