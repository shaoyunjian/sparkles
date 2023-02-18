let currentFriendName
let currentFriendId
let currentFriendAvatar
let currentRoomId
const isTypingMessage = document.querySelector(".typing")

// ------- get user's info from JWT -------
const jwt = document.cookie
const parts = jwt.split(".");
const payload = JSON.parse(atob(parts[1]))
const currentUserId = payload.id
const currentUsername = payload.name
const currentUserEmail = payload.email
const currentUserAvatar = payload.avatarUrl

// --------------- profile ----------------
const myAvatarUrl = document.querySelector("#my-avatar-url")
const myName = document.querySelectorAll(".my-name")
myAvatarUrl.src = currentUserAvatar

myName.forEach((name) => {
  name.textContent = currentUsername
})

// --------------- logout -----------------
//(unfinished)
// const logoutBtn = document.querySelector(".logout-btn")

// logoutBtn.addEventListener("click", () => {

//   fetchLogoutAPI()
//   async function fetchLogoutAPI() {
//     const response = await fetch("/api/user/auth", {
//       method: "DELETE",
//       headers: { "Content-Type": "application/json" }
//     })
//     const jsonData = await response.json()
//     if (jsonData.ok) {
//       window.location = "/login"
//     }
//   }
// })


// ------------- get chat list ------------

const chatListScrollbar = document.querySelector("#chat-list-scrollbar")

fetchChatListAPI(currentUserId)

async function fetchChatListAPI(senderId) {
  const response = await fetch("/api/chatroom", { method: "GET" })

  const jsonData = await response.json()

  let roomId
  let friendId
  let friendName
  let avatarUrl

  jsonData.data.forEach((data) => {
    roomId = data._id
    data.participants.forEach((value) => {
      if (value._id !== senderId) {
        friendId = value._id
        friendName = value.name
        avatarUrl = value.avatar_url
      }
    })

    chatListScrollbar.innerHTML += `
      <div id="${roomId}" class="chat-list-items" >
        <div class="ts-content is-dense chat-list-item">
          <div class="ts-row is-middle-aligned">
            <div class="column avatar">
              <div class="ts-avatar is-circular is-large">
                <img src="${avatarUrl}" />
              </div>
              <div class="avatar-badge" id="${friendId}"></div>
            </div>
            <div class="chat-list-middle-item column">
              <div class="ts-text is-bold">${friendName}</div>
              <div class="ts-text is-description chat-list-last-message">${data.last_message}
              </div>
            </div>
            <div class="chat-list-right-item column">
              <div class="ts-text is-description is-tiny">${data.last_message_time}</div>
              <div class="chat-list-time">9+</div>
            </div>
          </div>
        </div>
      </div>
    `
  })

  clickListToDisplayChatroom()

}

// ---------- render chatroom -------------

const welcomeBox = document.querySelector("#welcome-box")
const chatBox = document.querySelector("#chatbox")
const topBar = document.querySelector(".top-bar")
const chatBoxTopBarAvatar = document.querySelector("#chatbox-top-bar-avatar")
const chatBoxTopBarName = document.querySelector("#chatbox-top-bar-name")

// click chat list to display chatroom
const clickListToDisplayChatroom = () => {
  const chatListItems = document.querySelectorAll("#chat-list-scrollbar .chat-list-items")

  chatListItems.forEach((chatListItem, index) => {
    chatListItem.addEventListener("click", () => {
      welcomeBox.style.display = "none"
      chatBox.style.display = "flex"

      currentRoomId = chatListItems[index].id

      fetchChatroomAPI(currentRoomId)
      displayMessageHistory(currentRoomId)
    })
  })
}


// //------ 1 to 1 real-time chatroom --------

const socket = io()
const chatMessageBox = document.querySelector(".chat-message-box")
const chatScrollBar = document.querySelector(".middle-scollbar")
const sendMessageBtn = document.querySelector("#send-message-btn")
const inputMessage = document.querySelector("#input-message")

socket.emit("newUser", { currentUserId, currentUsername })

// socket on event
socket.on("message", message => {
  if (message.roomId === currentRoomId) {
    appendMessage(message)
    if (message.userId === currentUserId) {
      storeMessageToDB(message)
    }
  }
})

// leave room
socket.on("leaveRoom", (msg) => {
  console.log(msg)
})


// ------- emit message to server ----------

if (inputMessage) {
  emitMessageToServer(currentUsername, currentUserId)
}

function emitMessageToServer(currentUsername, currentUserId) {
  inputMessage.addEventListener("keypress", (event) => {
    const inputMessageValue = inputMessage.value
    const msgData = {
      text: inputMessageValue,
      username: currentUsername,
      id: currentUserId,
      avatarUrl: currentUserAvatar,
      roomId: currentRoomId,
      receiverId: currentFriendId,
    }
    if (event.key === "Enter") {
      if (inputMessageValue) {
        socket.emit("chatMessages", msgData)
        socket.emit("typing", "not typing")
      }
    }
  })

  sendMessageBtn.addEventListener("click", () => {
    const inputMessageValue = inputMessage.value
    const msgData = {
      text: inputMessageValue,
      username: currentUsername,
      id: currentUserId,
      avatarUrl: currentUserAvatar,
      roomId: currentRoomId,
      receiverId: currentFriendId,
    }

    if (inputMessageValue) {
      socket.emit("chatMessages", msgData)
      socket.emit("typing", "not typing")
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

  jsonData.data[0].participants.forEach((value) => {
    if (value._id !== currentUserId) {
      currentFriendId = value._id
      currentFriendName = value.name
      currentFriendAvatar = value.avatar_url
    }
  })
  chatBoxTopBarAvatar.innerHTML = `<img src="${currentFriendAvatar}" />`
  chatBoxTopBarName.textContent = currentFriendName

  checkTypingStatus(currentFriendId)
}

// ----- display text message history ------
async function displayMessageHistory(roomId) {
  const response = await fetch(`/api/message/${roomId}`, { method: "GET" })

  const jsonData = await response.json()

  if (jsonData.data) {
    chatMessageBox.textContent = ""

    jsonData.data.forEach((data) => {
      const historyMessage = {
        avatarUrl: data.sender.avatar_url,
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
  // console.log(msg)
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
        <div class="ts-avatar is-circular">
          <img src="${msg.avatarUrl}">
        </div>
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


// ---------- typing status -----------

function checkTypingStatus(currentFriendId) {

  inputMessage.addEventListener("input", () => {
    if (!inputMessage.value) {
      socket.emit("typing", "not typing")
    } else {
      const typingData = {
        userId: currentUserId,
        username: currentUsername,
        receiverId: currentFriendId,
        roomId: currentRoomId
      }
      socket.emit("typing", typingData)
    }
  })

  socket.on("isTyping", (data) => {
    if (data === "not typing") {
      isTypingMessage.style.display = "none"
    } else {
      isTypingMessage.style.display = "block"
      const typingDescription = document.querySelector(".typing-description")
      typingDescription.innerHTML = `${data.username} is typing`
    }

    // check if the user currently typing is in the same chatroom
    if (data.roomId !== currentRoomId) {
      isTypingMessage.style.display = "none"
    }

  })

}
