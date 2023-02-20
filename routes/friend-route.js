const express = require("express")
const router = express.Router()
const User = require("../models/user-schema")
const FriendRequest = require("../models/friendRequest-schema")
const { ObjectId } = require("mongodb")
const { cookieJwtAuth } = require("../cookieJwtAuth")

// -------- get friend list -----------

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


// ----------- add friend ------------

router.patch("/friend", async (req, res) => {
  const currentUserId = req.body.userId
  const friendId = req.body.friendId

  try {
    const currentUserData = await User
      .findOne({ _id: ObjectId(currentUserId) })

    // check if the user already exists in friend list
    const friendsData = currentUserData.friends
    const friendFound = friendsData.find(id => String(id) === friendId)
    if (friendFound) {
      res.status(400).send({
        "error": true,
        "message": "The user is in friend list already"
      })
    }

    if (!friendFound) {
      await User
        .findOneAndUpdate(
          { _id: ObjectId(currentUserId) },
          {
            $push: {
              friends: ObjectId(friendId)
            }
          }
        )

      res.status(200).send({
        "ok": true
      })
    }
  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": " Internal server error"
    })
  }
})


// ---------- friend request ----------

router.post("/friendRequest", async (req, res) => {
  const requesterId = req.body.requesterId
  const receiverId = req.body.receiverId
  const statusCode = req.body.friendRequestCode

  try {
    const friendRequestFound = await FriendRequest.findOne({
      $or: [{
        requesterId: requesterId,
        receiverId: receiverId
      }, {
        requesterId: receiverId,
        receiverId: requesterId
      }]
    })

    if (friendRequestFound) {
      res.status(400).send({
        "error": true,
        "message": "request already exists"
      })
    } else {
      await FriendRequest.create({
        requesterId: requesterId,
        receiverId: receiverId,
        statusCode: statusCode
      })

      res.status(200).send({
        "ok": true
      })
    }

  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": " Internal server error"
    })
  }
})

// --- change friend request status ----

router.patch("/friendRequest", async (req, res) => {
  const requesterId = req.body.requesterId
  const receiverId = req.body.receiverId
  const statusCode = req.body.friendRequestCode

  try {
    await FriendRequest.findOneAndUpdate({
      requesterId: requesterId,
      receiverId: receiverId,
    }, {
      statusCode: statusCode
    })

    res.status(200).send({
      "ok": true
    })
  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": " Internal server error"
    })
  }
})

// ---------- get request -------------

router.get("/friendRequest", cookieJwtAuth, async (req, res) => {
  const receiverId = req.query.friendId
  const userId = req.user.id

  try {
    const friendRequest = await FriendRequest.find({
      $or: [
        {
          requesterId: userId,
          receiverId: receiverId
        }, {
          requesterId: receiverId,
          receiverId: userId
        }
      ]
    })

    if (friendRequest) {
      res.status(200).send({
        "data": friendRequest
      })
    } else {
      res.status(200).send({
        "data": null
      })
    }

  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": " Internal server error"
    })
  }
})

// --------- delete request ------------

router.delete("/friendRequest", cookieJwtAuth, async (req, res) => {
  const requesterId = req.body.requesterId
  const receiverId = req.body.receiverId

  try {
    await FriendRequest.findOneAndDelete({
      requesterId: requesterId,
      receiverId: receiverId,
    })

    res.status(200).send({
      "ok": true
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