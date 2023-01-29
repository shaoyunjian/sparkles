const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  sender: {
    type: ObjectId,
    ref: 'User'
  },
  // sent_datetime: {
  //   type: Date,
  //   default: Date.now
  // },
  sent_time: {
    type: String
  },
  message_text: {
    type: String
  },
  chatroom_id: {
    type: ObjectId,
    ref: 'Classroom'
  }
})


module.exports = mongoose.model("Message", messageSchema)