const express = require("express")
const router = express.Router()
const { cookieJwtAuth } = require("../middleware/cookieJwtAuth")
const chatroomController = require("../controllers/chatroom-controller")

router.get("/chatroom", cookieJwtAuth, chatroomController.getChatList)

router.post("/chatroom", chatroomController.addParticipantsToChatroom)

router.patch("/chatroom", chatroomController.storeLatestMessageInfo)


module.exports = router