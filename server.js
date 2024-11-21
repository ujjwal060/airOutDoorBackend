require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cors = require("cors");
const cron = require('node-cron');

const apiRoutes = require("./apiRoutes");
const {calculateAndInitializePayouts} = require('./controller/payoutController');


const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use('/uploads', express.static('uploads'));

app.use(express.json());
app.use(bodyParser.json());

// app.use(express.urlencoded({ extended: true }));

app.use("/", apiRoutes);

cron.schedule('*/10 * * * * *', async () => {
  await calculateAndInitializePayouts();
});

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Node API app is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

module.exports = app;
