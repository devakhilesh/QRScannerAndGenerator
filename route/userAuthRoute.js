const express = require("express");

const {
  registerUser,
  logInUser,
  signInWithGoogle,
} = require("../controller/userAuthCtrl");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(logInUser);

router.route("/signInWithGoogle").post(signInWithGoogle);

module.exports = router;
