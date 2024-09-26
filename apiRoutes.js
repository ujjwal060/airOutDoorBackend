const express = require("express");
const adminauthRoute = require("./routes/adminRoute");
const vendorauthRoute = require("./routes/vendorRoute");
const userauthRoute=require('./routes/userRoute');
const catogriesRoute=require('./routes/catogriesRoute');
const propertyRoutes =require('./routes/propertyRoutes')
const bookingRoutes = require('./routes/bookingRoutes')

const router = express.Router();

// Routes
router.use("/admin", adminauthRoute);
router.use("/vendor", vendorauthRoute);
router.use("/user", userauthRoute);
router.use("/catogries", catogriesRoute);
router.use("/property", propertyRoutes);
router.use("/booking", bookingRoutes);

module.exports = router;
