const mongoose = require("mongoose");

const userAuthSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default:"user"
    },
  },
  { timestamps: true }
);

const userAuthModel = mongoose.model("User", userAuthSchema);

module.exports = userAuthModel;
