const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const chatroomSchema = new mongoose.Schema({
  participants: [{
    type: ObjectId,
    ref: "User"
  }],
  last_message: {
    type: String,
    default: "✨Start chatting now!"
  },
  last_message_time: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model("Chatroom", chatroomSchema)