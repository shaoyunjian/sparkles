const express = require("express")
const router = express.Router()
// const bodyParser = require('body-parser')
// router.use(bodyParser.urlencoded({ extended: false }))
// router.use(bodyParser.json())
const jwt = require("jsonwebtoken")
// const { cookieJwtAuth } = require("../cookieJwtAuth")

const mongoose = require('mongoose')
mongoose.connect(
  process.env.MONGODB_URL,
  {
    maxPoolSize: 10,
    dbName: process.env.MONGODB_DBNAME
  },
  mongoose.set('strictQuery', true)
)

const User = require("../models/user-schema")


// --------------- register ---------------

router.post("/user", async (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password

  try {
    const user = await User.exists({ email: email })
    if (!user) {
      User.create({
        name: name,
        email: email,
        password: password
      })
      res.status(200).send({ "ok": true })
    } else {
      res.status(400).send({
        "error": true,
        "message": "Email already exists"
      })
    }
  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": "Internal server error"
    })
  }
})



//  ----------- login -------------

router.put("/user/auth", async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  try {
    const userData = await User.findOne({ email: email, password: password })
    if (userData) {
      const payload = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatar_url
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7d" })
      res.cookie("token", token)

      res.status(200).send({ "ok": true })
    } else {
      res.status(400).send({
        "error": true,
        "message": "Email or password is wrong"
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


// ------ get current logged-in user's info ---------

router.get("/user/auth", async (req, res) => {
  try {
    const token = req.cookies.token
    if (token) {
      const jwtData = jwt.verify(token, process.env.JWT_SECRET_KEY)
      res.status(200).send({
        "data": {
          "id": jwtData.id,
          "name": jwtData.name,
          "email": jwtData.email,
          "avatar_url": jwtData.avatarUrl
        }
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


//  ----------- logout --------------

router.delete("/user/auth", (req, res) => {
  try {
    res.clearCookie("token")
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