const express = require("express");

const { registerUser, logInUser } = require("../controller/userAuthCtrl");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(logInUser);

module.exports = router;
