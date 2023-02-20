const mongoose = require("mongoose")
const { ObjectId } = require("mongodb")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar_url: {
    type: String,
    default: "https://d1gnt5bnf8w529.cloudfront.net/user.png"
  },
  friends: [{
    type: ObjectId,
    ref: "User"
  }]
})


module.exports = mongoose.model("User", userSchema)