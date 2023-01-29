const express = require("express")
const router = express.Router()
const mongoDB = require("../models/mongoose")
const Chatroom = require("../models/chatroom-schema")
const Message = require("../models/message-schema")
const { cookieJwtAuth } = require("../cookieJwtAuth")


// -----------------------------------------------
// "63d0e7f3e4b088d4fb44db06",
// "63ce96ef633bb17f1520a50b"

router.get("/chatroom", cookieJwtAuth, async (req, res) => {
  const senderId = req.user.id
  let friendData

  const chatroom = await Chatroom
    .find({
      participants: {
        $in: [
          senderId
        ]
      }
    })
    .populate({
      path: "participants",
      select: ["name", "email", "avatar_url"]
    })

  res.status(200).send({ "data": chatroom })
})

// ---------------- 取得聊天清單 ----------------------
// "63d0e7f3e4b088d4fb44db06",
// "63ce96ef633bb17f1520a50b"

router.get("/chatlist", async (req, res) => {
  const senderId = req.body.senderId
  const receiverId = req.body.receiverId

  const chatroom = await Chatroom.findOne({
    participants: {
      $all: [
        senderId,
        receiverId
      ]
    }
  }).populate({
    path: "participants",
    select: ["name", "email", "avatar_url"]
  })
  res.status(200).send({ "data": chatroom })
})


// -----------------------------------------------
// get chatroom ID： "/api/chatroom/63d2147931fb09bc0dd8ff9a"
// router.get("/chatroom/:id", async (req, res) => {
//   id = "63d2147931fb09bc0dd8ff9a"
//   res.status(200).send({ "ok": true })
// })

// -----------------------------------------------
// store message to database： "/api/message"

router.post("/message", async (req, res) => {
  const senderId = req.body.senderId
  const messageText = req.body.messageText
  const chatroomId = req.body.chatroomId
  const sentTime = req.body.sentTime

  try {
    const createMessage = await Message.create({
      sender: senderId,
      message_text: messageText,
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

// -----------------------------------------------
// get chat history："/api/message"

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

    res.status(200).send({
      "data": message
    })

  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": "Internal server error"
    })
  }

})


module.exports = router