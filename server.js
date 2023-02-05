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
const chatroomRouter = require("./routes/chatroom-route.js")
app.use("/api/", userRouter)
app.use("/api/", chatroomRouter)

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

app.get("/chatroom/:chatroomId", cookieJwtAuth, (req, res) => {
  res.render("chatroom")
})


// ---------------- socket io ---------------- 
const http = require("http")
const socketIo = require("socket.io")
const formatMessage = require("./utils/formatMessage")
const { userJoin, getCurrentUser } = require("./utils/users")

const server = http.createServer(app)
const io = socketIo(server)

io.on("connection", socket => {
  // join room
  socket.on("joinRoom", ({ currentUserId, currentUsername, currentRoomId }) => {
    const user = userJoin(socket.id, currentUserId, currentUsername, currentRoomId)

    socket.join(user.roomId)

    socket.on("disconnect", () => {
      io.emit("leaveRoom", "A user has left the chat")
    })
  })

  socket.on("chatMessages", (msg) => {
    const user = getCurrentUser(socket.id)
    io.to(user.roomId).emit("message", formatMessage(user.userId, user.username, msg.text, user.roomId))
  })

  // // emit msg to the client who connects
  // socket.emit("message", "哈囉我是後端")

  // // broadcast when a user connects
  // socket.broadcast.emit("message", "a user has joined the chat")

  // // runs when client disconnects
  // socket.on("disconnect", () => {
  // io.emit("message", "A user has left the chat")
  // })
})

// ---------------------------------------------- 


server.listen(port, () => {
  console.log(`App is running on port ${port}`)
})