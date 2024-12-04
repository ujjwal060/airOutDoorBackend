const express = require("express");
const adminauthRoute = require("./routes/adminRoute");
const vendorauthRoute = require("./routes/vendorRoute");
const userauthRoute=require('./routes/userRoute');
const catogriesRoute=require('./routes/catogriesRoute');
const propertyRoutes =require('./routes/propertyRoutes');
const bookingRoutes=require('./routes/bookingRoute');
const submitProperty=require('./routes/submitPropertyRoute');
const favorites=require('./routes/favoriteRoute');
const contactus=require('./routes/contactRoute');
const payouts=require('./routes/payoutRoute');
const blogs=require('./routes/blogRoutes');
const notification=require('./routes/notificationRoute');
const reviews=require('./routes/reviewRoute');
const pdf=require('./routes/pdfRoute');


const router = express.Router();

// Routes
router.use("/admin", adminauthRoute);
router.use("/vendor", vendorauthRoute);
router.use("/user", userauthRoute);
router.use("/catogries", catogriesRoute);
router.use("/property", propertyRoutes);
router.use('/booking',bookingRoutes);
router.use('/host',submitProperty);
router.use('/fav',favorites);
router.use('/contact',contactus);
router.use('/payouts',payouts);
router.use('/blogs',blogs);
router.use('/notification',notification);
router.use('/pdf',pdf);
router.use("/review", reviews);



module.exports = router;
