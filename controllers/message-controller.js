require("dotenv").config()
const Message = require("../models/message-schema")
const { uploadImageToS3 } = require("../config//s3")
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL


const storeMessageInDB = async (req, res) => {
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

}

const getChatHistory = async (req, res) => {
  try {
    const chatroomId = req.params.chatroomId
    const messageKeyword = req.query.messageKeyword
    const reg = new RegExp(messageKeyword, "i")

    if (messageKeyword) {

      const messageText = await Message
        .find(
          {
            $and: [{
              chatroom_id: chatroomId,
              message_text: { $regex: reg }
            }]
          })
        .sort({
          sent_time: -1
        })
        .populate({
          path: "sender",
          select: ["name", "email", "avatar_url"]
        })

      if (messageText) {
        res.status(200).send({
          "data": messageText
        })
      } else {
        res.status(200).send({
          "data": null
        })
      }

    } else {


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

    }
  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": "Internal server error"
    })
  }
}

const uploadFileToS3 = async (req, res) => {
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

}

module.exports = {
  storeMessageInDB,
  getChatHistory,
  uploadFileToS3
}