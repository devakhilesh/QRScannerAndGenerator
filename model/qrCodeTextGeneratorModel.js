/* const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const QrGeneratorTextSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    icon: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },

    purpose: {
      type: String,
    },

    contentType: {
      type: String,
      enum: ["link", "text"],
      default: "text",
    },

    text: {
      type: String,
      required: true,
    },
    file: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const QRGenratorText = mongoose.model("qrText", QrGeneratorTextSchema);

module.exports = QRGenratorText;
 */


const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const QrGeneratorTextSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true },
    icon: {
      public_id: String,
      url: String,
    },
    purpose: String,
    contentType: { type: String, enum: ["link", "text"], default: "text" },
    text: { type: String, required: true }, // Stores original text/link
    // txtFile: {
    //   // Added field for text file details
    //   public_id: String,
    //   url: String,
    // },
    file: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);


const QRGenratorText = mongoose.model("qrText", QrGeneratorTextSchema);

module.exports = QRGenratorText;