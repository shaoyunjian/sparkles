const express = require("express")
const router = express.Router()
const { cookieJwtAuth } = require("../middleware/cookieJwtAuth")
const friendController = require("../controllers/friend-controller")

// -------- friend --------------

router.get("/friend", cookieJwtAuth, friendController.getFriendList)

router.patch("/friend", friendController.addFriendToDB)


// ------- friend request ----------

router.post("/friendRequest", friendController.sendFriendRequest)

router.patch("/friendRequest", friendController.changeFriendRequestStatus)

router.get("/friendRequest", cookieJwtAuth, friendController.getFriendRequestInfo)

router.delete("/friendRequest", cookieJwtAuth, friendController.deleteFriendRequest)




module.exports = router