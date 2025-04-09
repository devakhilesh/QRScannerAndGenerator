const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const qrFileSchema = new mongoose.Schema(
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
      enum: ["image", "pdf"],
      default: "image",
    },

    uploadedFile: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
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

const QRGenratorfile = mongoose.model("qrImage", qrFileSchema);
module.exports = QRGenratorfile;
