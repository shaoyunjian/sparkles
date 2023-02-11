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
const friendlistRouter = require("./routes/friendlist-route.js")
app.use("/api/", userRouter)
app.use("/api/", chatroomRouter)
app.use("/api/", friendlistRouter)

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

app.get("/friendlist", cookieJwtAuth, (req, res) => {
  res.render("friendlist")
})


// ---------------- socket io ---------------- 
const http = require("http")
const socketIo = require("socket.io")
const formatMessage = require("./utils/formatMessage")
const { userConnect, getCurrentUser, getUserSocketIdByUserId, userDisconnect } = require("./utils/users")

const server = http.createServer(app)
const io = socketIo(server)

io.on("connection", socket => {
  // join room
  socket.on("joinRoom", ({ currentUserId, currentUsername, currentRoomId }) => {
    const user = userConnect(socket.id, currentUserId, currentUsername, currentRoomId)
    socket.join(user.roomId)

    socket.on("disconnect", () => {
      const user = userDisconnect(socket.id)

      if (user) {
        io.emit("leaveRoom", "A user has left the chat")
      }
    })
  })

  socket.on("chatMessages", (msg) => {
    const user = getCurrentUser(socket.id)
    io.to(user.roomId).emit("message", formatMessage(user.userId, user.username, msg.text, user.roomId))
  })


  // incoming audio call popup
  socket.on("audioCallPopup", (audioCallData) => {
    const receiverId = audioCallData.receiverId
    const userSocketId = getUserSocketIdByUserId(receiverId)

    const audioCallInfo = {
      callerName: audioCallData.callerName,
      callerAvatar: audioCallData.callerAvatar,
      roomId: audioCallData.roomId,
      peerId: audioCallData.callerId
    }

    userSocketId.forEach((userSocketIdData) => {
      io.to(userSocketIdData).emit("incomingCallPopup", audioCallInfo)
    })
  })

})

// ---------------------------------------------- 


server.listen(port, () => {
  console.log(`App is running on port ${port}`)
})