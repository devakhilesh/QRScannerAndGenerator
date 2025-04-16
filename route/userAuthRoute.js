const express = require("express");

const {
  registerUser,
  logInUser,
  signInWithGoogle,
  updateUser,
} = require("../controller/userAuthCtrl");
const { authenticationUser, authorizationUser } = require("../middi/userAuth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(logInUser);

router.route("/signInWithGoogle").post(signInWithGoogle);

router.route("/updateProfile").put(authenticationUser,authorizationUser,updateUser);



module.exports = router;

