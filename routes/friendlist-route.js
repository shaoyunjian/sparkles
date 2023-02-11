const express = require("express")
const router = express.Router()
const User = require("../models/user-schema")
const { ObjectId } = require("mongodb")
const { cookieJwtAuth } = require("../cookieJwtAuth")

// ---------------- get friend list -----------------

router.get("/friend", cookieJwtAuth, async (req, res) => {
  const currentUserId = req.user.id
  try {
    const friendData = await User
      .find({ _id: ObjectId(currentUserId) })
      .populate({
        path: "friends",
        select: ["name", "email", "avatar_url"]
      })

    const friendList = []

    friendData[0].friends.forEach((data) => {
      friendList.push(data)
    })

    res.status(200).send({
      "data": friendList
    })
  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": " Internal server error"
    })
  }
})



module.exports = router