const Chatroom = require("../models/chatroom-schema")
const { ObjectId } = require("mongodb")

const getChatList = async (req, res) => {
  const senderId = req.user.id
  const chatroomId = req.query.chatroomId

  if (chatroomId) {
    const chatroom = await Chatroom
      .findOne({
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
      .sort({
        last_message_time: -1
      })
      .populate({
        path: "participants",
        select: ["name", "email", "avatar_url"]
      })

    res.status(200).send({ "data": chatroom })
  }
}

const addParticipantsToChatroom = async (req, res) => {
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

}

const storeLatestMessageInfo = async (req, res) => {
  const roomId = req.body.chatroomId
  const lastMessage = req.body.lastMessage
  const lastMessageTime = req.body.lastMessageDateTime

  try {
    await Chatroom
      .findOneAndUpdate(
        { _id: ObjectId(roomId) },
        {
          last_message: lastMessage,
          last_message_time: lastMessageTime
        }
      )

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

module.exports = {
  getChatList,
  addParticipantsToChatroom,
  storeLatestMessageInfo,
}