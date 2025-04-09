const jwt = require("jsonwebtoken");
const offlineParentModel = require("../models/adminOfflineDataModel/adminOfflineParentModel/adminOfflineParentModel");

//======================== admin Authentication =====================

const authenticationParent = function (req, res, next) {
  try {
    let token = req.headers["x-offparent-token"];

    if (!token) {
      return res
        .status(400)
        .send({ status: false, message: " TOKEN REQUIRED" });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET_PARENT,
      async function (err, decoded) {
        if (err) {
          return res.status(401).send({ status: false, message: err.message });
        } else {
          const subAdminData = await offlineParentModel.findById(decoded.id);

          if (!subAdminData) {
            return res.status(404).send({
              status: false,
              message: "sub-admin not found / Register yourself / re logIn",
            });
          }

          req.parent = {
            _id: subAdminData._id,
            email: subAdminData.email,
            role: subAdminData.role,
            parentName: subAdminData.parentName,

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

const authorizationParent = async (req, res, next) => {
  let adminData = await offlineParentModel.findById(req.parent._id);
  if (!adminData) {
    return res.status(400).send({ status: false, messsage: "Invalid entry" });
  }
  let role = req.parent.role;
  // console.log(role);
  if (
    role != "Offline_Parent" &&
    req.parent._id.toString() != adminData._id.toString()
  ) {
    return res
      .status(403)
      .send({ status: false, message: "Unauthorize Access" });
  }
  next();
};

module.exports = { authenticationParent, authorizationParent };
