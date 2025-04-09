const jwt = require("jsonwebtoken");
const AdminAuthModel = require("../models/adminModel/adminAuthModel/adminAuthModel");

//======================== admin Authentication =====================

const authenticationAdmin = function (req, res, next) {
  try {
    let token = req.headers["x-admin-token"];

    if (!token) {
      return res
        .status(400)
        .send({ status: false, message: " TOKEN REQUIRED" });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET_KEY_ADMIN,
      async function (err, decoded) {
        if (err) {
          return res.status(401).send({ status: false, message: err.message });
        } else {
          const adminData = await AdminAuthModel.findById(decoded.id);

          if (!adminData) {
            return res
              .status(404)
              .send({
                status: false,
                message: "admin not found / Register yourself / re logIn",
              });
          }

          req.admin = {
            _id: adminData._id,
            email: adminData.email,
            role: adminData.role,
          };

          next();
        }
      }
    );
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ======================= admin authorizartion ====================

 const authorizationAdmin = async (req, res, next) => {
  let adminData = await AdminAuthModel.findOne({ email: req.admin.email });
  if (!adminData) {
    return res.status(400).send({ status: false, messsage: "Invalid entry" });
  }
  let role = req.admin.role;
  // console.log(role);
  if (role != "admin" && req.admin._id.toString() != adminData._id.toString()) {
    return res
      .status(403)
      .send({ status: false, message: "Unauthorize Access" });
  }
  next();
};


module.exports = {authenticationAdmin,authorizationAdmin}