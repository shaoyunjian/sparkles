const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const chatroomSchema = new mongoose.Schema({
  participants: [{
    type: ObjectId,
    ref: 'User'
  }],
  last_message: { type: String, default: null }, //test 
  last_message_time: { type: String, default: null } //test
})

module.exports = mongoose.model("Chatroom", chatroomSchema)