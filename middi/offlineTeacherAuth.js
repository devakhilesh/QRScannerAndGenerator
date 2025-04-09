const jwt = require("jsonwebtoken");
const offlineTeacherModel = require("../models/adminOfflineDataModel/adminOfflineTeacherModel/adminOfflineTeacherModel");

//======================== admin Authentication =====================

const authenticationTeacher = function (req, res, next) {
  try {
    let token = req.headers["x-offteacher-token"];

    if (!token) {
      return res
        .status(400)
        .send({ status: false, message: " TOKEN REQUIRED" });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET_TEACHER,
      async function (err, decoded) {
        if (err) {
          return res.status(401).send({ status: false, message: err.message });
        } else {
          const subAdminData = await offlineTeacherModel.findById(decoded.id);

          if (!subAdminData) {
            return res.status(404).send({
              status: false,
              message: "sub-admin not found / Register yourself / re logIn",
            });
          }

          req.teacher = {
            _id: subAdminData._id,
            email: subAdminData.email,
            role: subAdminData.role,
            expertise: subAdminData.expertise,
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

const authorizationTeacher = async (req, res, next) => {
  let adminData = await offlineTeacherModel.findById(req.teacher._id);
  if (!adminData) {
    return res.status(400).send({ status: false, messsage: "Invalid entry" });
  }
  let role = req.teacher.role;
  // console.log(role);
  if (
    role != "Offline_Teacher" &&
    req.teacher._id.toString() != adminData._id.toString()
  ) {
    return res
      .status(403)
      .send({ status: false, message: "Unauthorize Access" });
  }
  next();
};


module.exports = { authenticationTeacher, authorizationTeacher };
