const express = require("express")
const router = express.Router()
const userController = require("../controllers/user-controller")

// ------------- user ------------

router.post("/user", userController.signUp)

router.patch("/user", userController.editUserInfo)

router.get("/user", userController.getAllUsers)

// ------------- auth ------------

router.put("/user/auth", userController.signIn)

router.delete("/user/auth", userController.signOut)

router.get("/user/auth", userController.getCurrentLoggedInUserInfo)


module.exports = router