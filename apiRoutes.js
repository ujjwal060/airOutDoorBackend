const express = require("express");
const adminauthRoute = require("./routes/adminRoute");
const vendorauthRoute = require("./routes/vendorRoute");
const userauthRoute=require('./routes/userRoute');
const catogriesRoute=require('./routes/catogriesRoute');
const propertyRoutes =require('./routes/propertyRoutes')

const router = express.Router();

// Routes
router.use("/admin", adminauthRoute);
router.use("/vendor", vendorauthRoute);
router.use("/user", userauthRoute);
router.use("/catogries", catogriesRoute);
router.use("/property", propertyRoutes);

module.exports = router;
