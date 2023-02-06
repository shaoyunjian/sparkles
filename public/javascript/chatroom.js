// ------- get user's info from JWT -------
const jwt = document.cookie
const parts = jwt.split(".");
const payload = JSON.parse(atob(parts[1]))
const currentUserId = payload.id
const currentUsername = payload.name
const currentUserEmail = payload.email

//--------- get current room id -----------
const currentRoomId = window.location.href.split("/")[4]

// --------------- logout -----------------
const logoutBtn = document.querySelector(".logout-btn")

logoutBtn.addEventListener("click", () => {

  fetchLogoutAPI()
  async function fetchLogoutAPI() {
    const response = await fetch("/api/user/auth", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })
    const jsonData = await response.json()
    if (jsonData.ok) {
      window.location = "/login"
    }
  }
})


// ------------- get chat list ------------

const chatListScrollbar = document.querySelector("#chat-list-scrollbar")

fetchChatListAPI(currentUserId)

async function fetchChatListAPI(senderId) {
  const response = await fetch("/api/chatroom", { method: "GET" })

  const jsonData = await response.json()

  let friendName
  jsonData.data.forEach((data) => {
    data.participants.forEach((value) => {
      if (value._id !== senderId) {
        friendName = value.name
      }
    })
    chatListScrollbar.innerHTML += `
      <a href="/chatroom/${data._id}">
        <div class="chat-list-message-box" data-id="${data._id}">
          <div class="avatar">${friendName[0]}</div>
          <div class="name-message">
            <div class="name">${friendName}</div>
            <div class="message">${data.last_message}</div>
          </div>
          <div class="message-time">${data.last_message_time}</div>
        </div>
      </a>
    `
  })

}

// ---------- render chatroom -------------

const chatBoxTopBarAvatar = document.querySelector("#chatbox-top-bar-avatar")
const chatBoxTopBarName = document.querySelector("#chatbox-top-bar-name")

if (currentRoomId) {
  fetchChatroomAPI(currentRoomId)
  displayMessageHistory(currentRoomId)
} else {
  document.querySelector("#chatbox").classList.add("display-none")
}

//------ 1 to 1 real-time chatroom --------

const socket = io()
const chatScrollBar = document.querySelector(".middle-scollbar")
const chatMessageBox = document.querySelector(".chat-message-box")
const sendMessageBtn = document.querySelector("#send-message-btn")
const inputMessage = document.querySelector("#input-message")
chatScrollBar.scrollTop = chatScrollBar.scrollHeight

// join room 
socket.emit("joinRoom", { currentUserId, currentUsername, currentRoomId })

// socket on event
socket.on("message", message => {
  appendMessage(message)
  if (message.userId === currentUserId) {
    storeMessageToDB(message)
  }
})

// leave room
socket.on("leaveRoom", (msg) => {
  console.log(msg)
})

// ------- emit message to server ----------

emitMessageToServer(currentUsername, currentUserId)

function emitMessageToServer(currentUsername, currentUserId) {
  inputMessage.addEventListener("keypress", (event) => {
    const inputMessageValue = inputMessage.value
    const msgData = {
      text: inputMessageValue,
      username: currentUsername,
      id: currentUserId,
      roomId: currentRoomId
    }
    if (event.key === "Enter") {
      if (inputMessageValue) {
        socket.emit("chatMessages", msgData)
      }
    }
  })

  sendMessageBtn.addEventListener("click", () => {
    const inputMessageValue = inputMessage.value
    const msgData = {
      text: inputMessageValue,
      username: currentUsername,
      id: currentUserId,
      roomId: currentRoomId
    }
    if (inputMessageValue) {
      socket.emit("chatMessages", msgData)
    }
  })
}

// ---- store my message into database -----
async function storeMessageToDB(message) {
  const response = await fetch("/api/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId: message.userId,
      messageText: message.message,
      chatroomId: message.roomId,
      sentTime: message.time
    })
  })
}

// ------ get chatroom information ---------
async function fetchChatroomAPI(roomId) {
  const response = await fetch(`/api/chatroom?chatroomId=${roomId}`)

  const jsonData = await response.json()
  let friendName
  jsonData.data[0].participants.forEach((value) => {
    if (value._id !== currentUserId) {
      friendName = value.name
    }
  })
  chatBoxTopBarAvatar.innerHTML = `<p>${friendName[0]}</p>`
  chatBoxTopBarName.textContent = friendName
}

// ----- display text message history ------
async function displayMessageHistory(roomId) {
  const response = await fetch(`/api/message/${roomId}`, { method: "GET" })

  const jsonData = await response.json()

  if (jsonData.data) {
    chatMessageBox.textContent = ""

    jsonData.data.forEach((data) => {
      const historyMessage = {
        userId: data.sender._id,
        username: data.sender.name,
        message: data.message_text,
        time: data.sent_time
      }

      appendMessage(historyMessage)
    })
  } else {
    chatMessageBox.innerHTML = "沒有任何訊息"
  }

}

// --------- append message bubble --------
function appendMessage(msg) {
  // const dateDivider = `<div class="ts-divider is-center-text ts-text is-small" style="color: var(--ts-gray-500);">2022-02-03</div>`

  const myMessage = `
    <div class="sender-message">         
      <div class="sender-name"></div>
      <div class="sender-bubble-box">
        <div class="sending-time">${msg.time}</div>
        <div class="sender-bubble bubble">${msg.message}</div>
      </div>
    </div>
  `
  const friendMessage = `
    <div class="receiver-message"> 
      <div class="receiver-avatar">
        <p>${msg.username[0]}</p>
      </div>
      <div class="receiver-name-bubble">
        <div class="receiver-name">${msg.username}</div>
        <div class="receiver-bubble-box">
          <div class="receiver-bubble bubble">${msg.message}</div>
          <div class="receiving-time">${msg.time}</div>
        </div>
      </div>
    </div>
  `

  if (msg.userId === currentUserId) {
    chatMessageBox.innerHTML += myMessage
  } else {
    chatMessageBox.innerHTML += friendMessage
  }

  chatScrollBar.scrollTop = chatScrollBar.scrollHeight
  inputMessage.value = ""
}

