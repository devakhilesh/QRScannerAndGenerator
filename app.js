// express
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const credentials = require("./middi/credentials.js");
const corsOptions = require("./config/corsOptions.js");
require("dotenv/config");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(credentials);
app.use(cors());

/* app.use(
  fileUpload({
    useTempFiles: true,  // changed to false
    tempFileDir: "/tmp/",
    limits: { fileSize: 2 * 1024 * 1024 },
  })
); */

// disk not uses upload without locally storage ...

const path = require('path');
const fs = require('fs');
const { createQrGeneratorText, generateImageToQrCode } = require("./controller/qrCodeGeneratorCtrl.js");

app.use(
  fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 },
  })
);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Route
app.get("/", async (req, res) => {
  res.status(200).json({ status: true, message: "app is working perfect" });
});


const user = require("./routing/userRouting.js")

app.use("/",user)

// app.post("/create", createQrGeneratorText)
// app.post("/img", generateImageToQrCode)


module.exports = app;
