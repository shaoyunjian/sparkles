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
const friendRouter = require("./routes/friend-route.js")
const messageRouter = require("./routes/message-route.js")
app.use("/api/", userRouter)
app.use("/api/", chatroomRouter)
app.use("/api/", friendRouter)
app.use("/api/", messageRouter)

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


// ---------------- socket io ---------------- 
const http = require("http")
const socketIo = require("socket.io")
const { userConnect, getCurrentUser, getUserSocketIdByUserId, userDisconnect } = require("./utils/users")

const server = http.createServer(app)
const io = socketIo(server)

const onlineUsers = new Set()
io.on("connection", socket => {

  socket.on("newUser", ({ currentId, currentName }) => {
    socket.userId = currentId
    onlineUsers.add(currentId)
    const user = userConnect(socket.id, currentId, currentName)

    io.emit("newUser", [...onlineUsers]) //emit to all online users
  })

  socket.on("chatMessages", (msg) => {
    const user = getCurrentUser(socket.id)
    const friendSocketId = getUserSocketIdByUserId(msg.receiverId)
    const mySocketId = getUserSocketIdByUserId(user.userId)

    io.to(mySocketId).to(friendSocketId).emit("message", msg)
  })

  socket.on("typing", (data) => {
    const friendSocketId = getUserSocketIdByUserId(data.receiverId)

    socket.broadcast.to(friendSocketId).emit("isTyping", data)
  })

  // friend request notification
  socket.on("friendRequest", (request) => {
    const friendSocketId = getUserSocketIdByUserId(request.receiverId)

    if (request.type === "request-sent") {
      io.to(friendSocketId).emit("requestSended", `${request.requesterName}`)
    } else if (request.type === "request-accepted") {
      io.to(friendSocketId).emit("requestAccepted", `${request.requesterName}`)
    }
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

  // end call
  socket.on("endCall", (endCallData) => {
    // console.log(endCallData)
    socket.emit("endCallReceived", "Close Popup")

    const receiverId = endCallData.receiverId
    const userSocketId = getUserSocketIdByUserId(receiverId)

    // const endCallInfo = {
    //   callerName: endCallData.callerName,
    //   callerAvatar: endCallData.callerAvatar,
    //   roomId: endCallData.roomId,
    //   peerId: endCallData.callerId
    // }

    userSocketId.forEach((userSocketIdData) => {
      io.to(userSocketIdData).emit("endCallReceived", "Close Popup1")
    })
  })

  socket.on("disconnect", () => {
    userDisconnect(socket.id)
    onlineUsers.delete(socket.userId)

    io.emit("userDisconnected", socket.userId)
  })

})

// ---------------------------------------------- 


server.listen(port, () => {
  console.log(`App is running on port ${port}`)
})