const express = require("express");
const { authenticationUser, authorizationUser } = require("../middi/userAuth");
const {
  createQrGeneratorText,
  getAllQrGeneratorTexts,
  deleteQrGeneratorText,
} = require("../controller/qrCodeGeneratorCtrl");

const router = express.Router();

router
  .route("/create")
  .post(authenticationUser, authorizationUser, createQrGeneratorText);

router
  .route("/get")
  .get(authenticationUser, authorizationUser, getAllQrGeneratorTexts);

router
  .route("/delete/:id")
  .put(authenticationUser, authorizationUser, deleteQrGeneratorText);

module.exports = router;
