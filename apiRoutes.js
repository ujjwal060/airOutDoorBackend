const express = require("express");
const adminauthRoute = require("./routes/adminRoute");
const vendorauthRoute = require("./routes/vendorRoute");
const userauthRoute=require('./routes/userRoute')

const router = express.Router();

// Routes
router.use("/admin", adminauthRoute);
router.use("/vendor", vendorauthRoute);
router.use("/user", userauthRoute);

module.exports = router;
