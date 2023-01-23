const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  avatar_url: { type: String, default: "https://d1gnt5bnf8w529.cloudfront.net/default-avatar.jpg" }
})


module.exports = mongoose.model("user", userSchema)