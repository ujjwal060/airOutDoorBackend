const express = require("express");
const adminauthRoute = require("./routes/adminRoute");
const vendorauthRoute = require("./routes/vendorRoute");

const router = express.Router();

// Routes
router.use("/admin", adminauthRoute);
router.use("/vendor", vendorauthRoute);

module.exports = router;
