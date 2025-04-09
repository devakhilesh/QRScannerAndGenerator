const jwt = require("jsonwebtoken");
const userAuthModel = require("../model/userAuthModel");
const QRGenratorText = require("../model/qrCodeTextGeneratorModel");
const QRGenratorfile = require("../model/qrCodeGeneratorFileModel");

//==================== authentication ===============================

exports.authenticationUser = function (req, res, next) {
  let token = req.headers["x-user-token"];

  if (!token) {
    return res.status(400).send({ status: false, message: " TOKEN REQUIRED" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET_KEY_USER,
    async function (err, decoded) {
      if (err) {
        return res.status(401).send({ status: false, message: err.message });
      } else {
        const userData = await userAuthModel.findById(decoded._id);
       
        if (!userData) {
          return res.status(404).send({ status: false, message: "User not found / Register yourself / re logIn" });
        }
    
        req.user = {
          _id: userData._id,
          role: userData.role, 
          email:userData.email ||""
        };
        console.log(req.user.role);

        next();
      }
    }
  );
};

// =========================================== User Authorizartion =====================================

exports.authorizationUser = async (req, res, next) => {
  let UserData = await userAuthModel.findById(req.user._id);
  if (!UserData) {
    return res.status(400).send({ status: false, messsage: "Invalid entry" });
  }
  let role = req.user.role;
//   console.log(role);
  if (
    role !== "user" &&
    req.user._id.toString() != UserData._id.toString()
  ) {
    return res
      .status(403)
      .send({ status: false, message: "Unauthorize Access" });
  }
  next();
};
 