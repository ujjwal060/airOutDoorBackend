const express = require("express");
const adminauthRoute = require("./routes/adminRoute");
const vendorauthRoute = require("./routes/vendorRoute");
const userauthRoute=require('./routes/userRoute');
const catogriesRoute=require('./routes/catogriesRoute');
const propertyRoutes =require('./routes/propertyRoutes');
const bookingRoutes=require('./routes/bookingRoute');
const submitProperty=require('./routes/submitPropertyRoute');
const favorites=require('./routes/favoriteRoute');
const reviewRoute=require('./routes/reviewRoute');

const router = express.Router();

// Routes
router.use("/admin", adminauthRoute);
router.use("/vendor", vendorauthRoute);
router.use("/user", userauthRoute);
router.use("/catogries", catogriesRoute);
router.use("/property", propertyRoutes);
router.use('/booking',bookingRoutes);
router.use('/host',submitProperty);
router.use('/review',reviewRoute);
router.use('/fav',favorites);

module.exports = router;