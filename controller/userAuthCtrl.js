const userAuthModel = require("../model/userAuthModel");

const jwt = require("jsonwebtoken");

// regiter
exports.registerUser = async (req, res) => {
  try {
    const data = req.body;
    const { name, email, password } = data;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ status: false, message: "All Fields are required" });
    }

    const check = await userAuthModel.findOne({ email: email });

    if (check) {
      return res
        .status(400)
        .json({ status: false, message: "Already registered LogIn Now" });
    }

    const saveUserData = await userAuthModel.create(data);
    if (!saveUserData) {
      return res
        .status(400)
        .json({ status: false, message: "sommething wents worng" });
    }

    return res.status(201).json({
      status: false,
      messaage: "Registered Successfully",
      data: saveUserData,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

/// LogIn
exports.logInUser = async (req, res) => {
  try {
    const data = req.body;

    const { email, password } = data;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Please provide your email and password",
      });
    }

    const check = await userAuthModel.findOne({
      email: email,
      password: password,
    });

    if (!check) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Eamil or password entry" });
    }

    const token = jwt.sign({ _id: check._id }, process.env.JWT_SECRET_KEY_USER);

    return res
      .status(200)
      .json({
        status: true,
        message: "User LogedIn Successfully",
        data: check,
        token: token,
      });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
