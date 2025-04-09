

const mongoose = require("mongoose");
/* 
const qrDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrType: {
      type: String,
      enum: ["contact", "wifi", "link"],
      required: true,
    },
    // For contact QR codes
    contactData: {
      firstName: String,
      lastName: String,
      phone: String,
      email: String,
    },
    // For WiFi QR codes
    wifiData: {
      ssid: String,
      encryption: { type: String, enum: ["WEP", "WPA", "nopass"] },
      password: String,
    },
    // For link QR codes
    linkData: {
      url: String,
    },
    // Generated QR code image URL (after generating)
    qrCodeUrl: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const QRData = mongoose.model("QRData", qrDataSchema);
module.exports = QRData;

 */
const QRCode = require("qrcode");


const generateContactQR = async (contact) => {
  // Create a simple vCard representation
  const { firstName, lastName, phone, email } = contact;
  const vCardData = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName}
TEL:${phone}
EMAIL:${email}
END:VCARD`;

  try {
    // Generate QR code data URL
    const qrUrl = await QRCode.toDataURL(vCardData);
    return qrUrl;
  } catch (err) {
    throw new Error("Error generating contact QR code");
  }
};


const generateWifiQR = async (wifi) => {
  // WiFi QR codes must follow the standard format: WIFI:S:SSID;T:WPA/WEP;nopass;P:PASSWORD;;
  const { ssid, encryption, password } = wifi;
  const wifiData = `WIFI:S:${ssid};T:${encryption};P:${password};;`;

  try {
    const qrUrl = await QRCode.toDataURL(wifiData);
    return qrUrl;
  } catch (err) {
    throw new Error("Error generating WiFi QR code");
  }
};

const generateLinkQR = async (link) => {
  const { url } = link;

  try {
    const qrUrl = await QRCode.toDataURL(url);
    return qrUrl;
  } catch (err) {
    throw new Error("Error generating link QR code");
  }
};



const express = require("express");
const router = express.Router();
const QRData = require("./models/QRData");

router.post("/generate", async (req, res) => {
  const { qrType, contactData, wifiData, linkData, userId } = req.body;
  let qrCodeUrl;

  try {
    if (qrType === "contact") {
      qrCodeUrl = await generateContactQR(contactData);
    } else if (qrType === "wifi") {
      qrCodeUrl = await generateWifiQR(wifiData);
    } else if (qrType === "link") {
      qrCodeUrl = await generateLinkQR(linkData);
    } else {
      return res.status(400).json({ error: "Unsupported QR type" });
    }

    // Save QR data to database
    const qrData = new QRData({
      userId,
      qrType,
      contactData,
      wifiData,
      linkData,
      qrCodeUrl,
    });

    await qrData.save();
    res.json({ qrCodeUrl, qrData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;