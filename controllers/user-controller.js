const User = require("../models/user-schema")
const mongoDB = require("../config/mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { userDataValidation } = require("../utils/auth")
const { profileEditValidation } = require("../utils/profile")


const signUp = async (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password

  //------- bcrypt hash -------
  const salt = await bcrypt.genSalt(10) // random string for hashing password
  const hashedInput = await bcrypt.hash(password, salt)

  try {
    const userValidationResult = userDataValidation(name, email, password)

    if (!name || !email || !password) {
      res.status(400).send({
        "error": true,
        "message": "Empty input"
      })
    } else if (userValidationResult === "invalid name") {
      res.status(400).send({
        "error": true,
        "message": "invalid name format"
      })
    } else if (userValidationResult === "invalid email") {
      res.status(400).send({
        "error": true,
        "message": "invalid email format"
      })
    } else if (userValidationResult === "invalid password") {
      res.status(400).send({
        "error": true,
        "message": "invalid password format"
      })
    } else if (userValidationResult === "valid") {
      const user = await User.exists({ email: email })
      if (!user) {
        User.create({
          name: name,
          email: email,
          password: hashedInput
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
}

const getAllUsers = async (req, res) => {
  try {
    const keyword = req.query.keyword
    const reg = new RegExp(keyword, "i")

    if (!keyword) return

    const user = await User.find(
      {
        $or: [
          { name: { $regex: reg } },
          { email: { $regex: reg } }
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
}

const editUserInfo = async (req, res) => {
  const email = req.body.email
  const name = req.body.name
  const password = req.body.password
  const avatarUrl = req.body.avatarUrl
  const profileStatus = req.body.profileStatus

  try {
    // "": request for editing exists, but empty input.
    // undefined: request for editing doesn't exist, so the value is undefined.
    if (name === "" || password === "") {
      res.status(400).send({
        "error": true,
        "message": "Empty input"
      })
    } else {
      const token = req.cookies.token
      if (token) {
        const jwtData = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userExist = await User.findOne({ email: email })

        if (userExist.email === jwtData.email) {
          const result = profileEditValidation(name, password)

          if (result === "invalid username") {
            res.status(400).send({
              "error": true,
              "message": "invalid name format"
            })
          } else if (result === "invalid password") {
            res.status(400).send({
              "error": true,
              "message": "invalid password format"
            })
          } else {
            await User.findOneAndUpdate({
              email: email,
            }, {
              name: name,
              password: password,
              avatar_url: avatarUrl,
              profile_status: profileStatus
            })

            res.status(200).send({ "ok": true })
          }
        } else {
          res.status(400).send({
            "error": true,
            "message": "wrong user"
          })
        }
      } else {
        res.status(400).send({
          "error": true,
          "message": "token error"
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
}

const signIn = async (req, res) => {
  const emailInput = req.body.email
  const passwordInput = req.body.password

  try {
    if (!emailInput || !passwordInput) {
      res.status(400).send({
        "error": true,
        "message": "Empty input"
      })
    } else {
      //bcrypt check 
      const userInfo = await User.findOne({ email: emailInput })
      const hashedPassword = userInfo.password
      const bcryptResult = bcrypt.compareSync(passwordInput, hashedPassword)

      const userData = await User.findOne({ email: emailInput, password: hashedPassword })

      if (bcryptResult && userData) {
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

}

const getCurrentLoggedInUserInfo = async (req, res) => {
  try {
    const token = req.cookies.token
    if (token) {
      const jwtData = jwt.verify(token, process.env.JWT_SECRET_KEY)
      const userData = await User.findOne({ _id: jwtData.id })

      if (userData) {
        res.status(200).send({
          "data": {
            "id": userData.id,
            "name": userData.name,
            "email": userData.email,
            "avatar_url": userData.avatar_url
          }
        })
      } else {
        res.status(200).send({
          "data": null
        })
      }
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
}

const signOut = (req, res) => {
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
}

module.exports = {
  signUp,
  getAllUsers,
  editUserInfo,
  signIn,
  getCurrentLoggedInUserInfo,
  signOut
}