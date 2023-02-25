const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const chatroomSchema = new mongoose.Schema({
  participants: [{
    type: ObjectId,
    ref: 'User'
  }],
  last_message: { type: String, default: "" },
  last_message_time: { type: Date, default: "" }
})

module.exports = mongoose.model("Chatroom", chatroomSchema)