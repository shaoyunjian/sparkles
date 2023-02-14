const express = require("express")
const router = express.Router()
const mongoDB = require("../models/mongoose")
const Chatroom = require("../models/chatroom-schema")
const Message = require("../models/message-schema")
const { cookieJwtAuth } = require("../cookieJwtAuth")


// ------------ get chat list  ------------

router.get("/chatroom", cookieJwtAuth, async (req, res) => {
  const senderId = req.user.id
  const chatroomId = req.query.chatroomId

  if (chatroomId) {
    const chatroom = await Chatroom
      .find({
        _id: {
          $eq: chatroomId
        }
      })
      .populate({
        path: "participants",
        select: ["name", "email", "avatar_url"]
      })

    res.status(200).send({ "data": chatroom })
  } else {
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
  }
})

// ---- add participants to chatroom -------

router.post("/chatroom", async (req, res) => {
  const participants = req.body.participants

  try {
    const chatroomExists = await Chatroom
      .exists({
        $or: [{
          participants: [participants[0], participants[1]]
        },
        {
          participants: [participants[1], participants[0]]
        }
        ]
      })

    if (!chatroomExists) {
      await Chatroom.create({
        participants: participants
      })

      res.status(200).send({
        "ok": true
      })
    } else {
      res.status(400).send({
        "error": true,
        "message": "Chatroom already exists"
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


// ------- store message to database -------

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


module.exports = router