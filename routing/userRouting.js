const express = require("express")

const user = express()

const uerAuth = require("../route/userAuthRoute")
const fileToQrRoute = require("../route/fileQrRoute")
const textToQrRoute = require("../route/textToQrRoute")


user.use("/user/auth",uerAuth)

user.use("/user/fileToQr",fileToQrRoute)

user.use("/user/textToQr", textToQrRoute)


module.exports = user