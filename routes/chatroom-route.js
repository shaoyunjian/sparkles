const express = require("express")
const router = express.Router()
const Chatroom = require("../models/chatroom-schema")
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



module.exports = router