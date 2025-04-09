const express = require("express")
const { authenticationUser, authorizationUser } = require("../middi/userAuth")
const { generateFileToQrCode, deleteFileQrCode, getAllFileQrCodes } = require("../controller/qrCodeGeneratorCtrl")

const router = express.Router()



router.route("/create").post(authenticationUser,authorizationUser,generateFileToQrCode)

router.route("/get").get(authenticationUser,authorizationUser,getAllFileQrCodes)

router.route("/delete/:id").put(authenticationUser,authorizationUser,deleteFileQrCode)




module.exports = router