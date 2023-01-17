require("dotenv").config()

const express = require("express")
const app = express()
const port = process.env["PORT"]

app.use(express.static('public/images'))
app.use(express.static('public/css'))
app.use(express.static('public/javascript'))
app.set("view engine", "ejs")


app.get("/", (req, res) => {
  res.render("index")
})

app.get("/chatroom", (req, res) => {
  res.render("chatroom")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})