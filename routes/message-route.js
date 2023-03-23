const express = require("express")
const router = express.Router()
const fileUpload = require("express-fileupload")
router.use(fileUpload())
const { cookieJwtAuth } = require("../middleware/cookieJwtAuth")
const messageController = require("../controllers/message-controller")

// ------------ message ------------

router.post("/message", messageController.storeMessageInDB)

router.get("/message/:chatroomId", messageController.getChatHistory)


// --- upload image to AWS S3 ------

router.post("/file", cookieJwtAuth, messageController.uploadFileToS3)


module.exports = router