const mongoose = require("mongoose")
const { ObjectId } = require("mongodb")

const friendRequestSchema = new mongoose.Schema({
  requesterId: {
    type: ObjectId,
    ref: "User"
  },
  receiverId: {
    type: ObjectId,
    ref: "User"
  },
  statusCode: {
    type: Number,
    default: 0,
    // 0 ⇒ not-friend
    // 1 ⇒ friend-request-sended
    // 2 ⇒ accepted
  }
})

module.exports = mongoose.model("FriendRequest", friendRequestSchema)