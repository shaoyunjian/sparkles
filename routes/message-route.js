require("dotenv").config()
const express = require("express")
const router = express.Router()
const Message = require("../models/message-schema")
const { cookieJwtAuth } = require("../cookieJwtAuth")
const { uploadImageToS3 } = require("../models/s3")
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL
const fileUpload = require("express-fileupload")
router.use(fileUpload())


// ------- store message to database -------

router.post("/message", async (req, res) => {
  const senderId = req.body.senderId
  const messageText = req.body.messageText
  const messageImageUrl = req.body.messageImageUrl
  const chatroomId = req.body.chatroomId
  const sentTime = req.body.sentTime

  try {
    await Message.create({
      sender: senderId,
      message_text: messageText,
      image_url: messageImageUrl,
      chatroom_id: chatroomId,
      sent_time: sentTime
    })

    res.status(200).send({
      "ok": true
    })
  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": "Internal server error"
    })
  }

})

// --------- get chat history -------------

router.get("/message/:chatroomId", async (req, res) => {
  const chatroomId = req.params.chatroomId
  try {
    const message = await Message
      .find({
        chatroom_id: chatroomId
      })
      .populate({
        path: "sender",
        select: ["name", "email", "avatar_url"]
      })

    if (message.length > 0) {
      res.status(200).send({
        "data": message
      })
    } else {
      res.status(200).send({
        "data": null
      })
    }


  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": "Internal server error"
    })
  }

})

// ---------- upload image to AWS S3 ---------

router.post("/file", cookieJwtAuth, async (req, res) => {
  const file = req.files.image

  const now = new Date()
  const userIdSubstring = req.user.id.slice(18, 24)
  const editedFilename = now.toISOString().replace(/[-:.TZ]/g, '') + userIdSubstring
  const cloudFrontUrl = CLOUDFRONT_URL + editedFilename

  try {
    const result = await uploadImageToS3(file, editedFilename)

    if (result.Location) {
      res.status(200).send({
        "data": cloudFrontUrl
      })
    }
  } catch (e) {
    console.log(e)
    res.status(500).send({
      "error": true,
      "message": "Interval error"
    })
  }

})


module.exports = router