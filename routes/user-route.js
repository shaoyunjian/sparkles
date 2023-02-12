const express = require("express")
const router = express.Router()
// const bodyParser = require('body-parser')
// router.use(bodyParser.urlencoded({ extended: false }))
// router.use(bodyParser.json())
const jwt = require("jsonwebtoken")
// const { cookieJwtAuth } = require("../cookieJwtAuth")

const User = require("../models/user-schema")
const mongoDB = require("../models/mongoose")

// ----------- register -----------

router.post("/user", async (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password

  try {
    if (!name || !email || !password) {
      res.status(400).send({
        "error": true,
        "message": "Empty input"
      })
    } else {
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
    }
  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      "error": true,
      "message": "Internal server error"
    })
  }
})

// -------- get all users ---------

router.get("/user", async (req, res) => {
  const name = req.query.name
  const email = req.query.email

  try {
    const user = await User
      .find({
        $or: [
          { name: name },
          { email: email }
        ]
      })

    const userData = []
    user.forEach((value) => {
      const data = {
        id: value._id,
        name: value.name,
        email: value.email,
        avatar: value.avatar_url
      }
      userData.push(data)
    })

    if (userData) {
      res.status(200).send({
        "data": userData
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


//  ----------- login -------------

router.put("/user/auth", async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  try {
    if (!email || !password) {
      res.status(400).send({
        "error": true,
        "message": "Empty input"
      })
    } else {
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