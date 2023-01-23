require("dotenv").config()
const express = require("express")
const app = express()
const port = process.env.PORT
const cookieParser = require("cookie-parser")
app.use(express.json()) // body-parser 
app.use(cookieParser())

// static folder
app.use(express.static("public/images"))
app.use(express.static("public/css"))
app.use(express.static("public/javascript"))
app.set("view engine", "ejs")

// routes 
const userRouter = require("./routes/user-route.js")
app.use("/api/", userRouter)

// middleware
const { cookieJwtAuth } = require("./cookieJwtAuth")

// -----------------------------

app.get("/", (req, res) => {
  res.render("index")
})

app.get("/login", (req, res) => {
  res.render("login")
})

app.get("/chatroom", cookieJwtAuth, (req, res) => {
  res.render("chatroom")
})


app.listen(port, () => {
  console.log(`App is running on port ${port}`)
})