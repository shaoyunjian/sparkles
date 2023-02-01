// --------------- logout ------------------

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


// ------------- get chat list -------------

const chatListScrollbar = document.querySelector("#chat-list-scrollbar")

async function fetchChatListAPI(senderId) {
  const response = await fetch("/api/chatroom", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })

  const jsonData = await response.json()

  let friendName
  jsonData.data.forEach((data) => {
    data.participants.forEach((value) => {
      if (value._id !== senderId) {
        friendName = value.name
      }
    })
    chatListScrollbar.innerHTML += `
      <div class="chat-list-message-box" data-id="${data._id}">
        <div class="avatar">${friendName[0]}</div>
        <div class="name-message">
          <div class="name">${friendName}</div>
          <div class="message">${data.last_message}</div>
        </div>
        <div class="message-time">${data.last_message_time}</div>
      </div>
    `
  })

}


//------------- socket io --------------------

const socket = io()
const chatScrollBar = document.querySelector(".middle-scollbar")
const chatMessageBox = document.querySelector("#chat-message-box")
const sendMessageBtn = document.querySelector("#send-message-btn")
const inputMessage = document.querySelector("#input-message")
chatScrollBar.scrollTop = chatScrollBar.scrollHeight


// --------- send my message ----------------- 

fetchCurrentUserAPI()
async function fetchCurrentUserAPI() {
  const response = await fetch("/api/user/auth", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })

  const jsonData = await response.json()
  const currentUsername = jsonData.data.name
  const currentUserId = jsonData.data.id
  console.log("目前登入的使用者名：", currentUsername)
  console.log("目前登入的使用者ID：", currentUserId)

  // get current chat list
  fetchChatListAPI(currentUserId)
  // click on a chat in the list to join the corresponding chat room
  clickChatList(currentUserId)

  // --------------- handle input Messages ----------------
  inputMessage.addEventListener("keypress", (event) => {
    const inputMessageValue = inputMessage.value
    const msgData = {
      text: inputMessageValue,
      username: currentUsername,
      id: currentUserId
    }
    if (event.key === "Enter") {
      if (inputMessageValue) {
        // emit message to server
        socket.emit("chatMessages", msgData)
      }
    }
  })

  sendMessageBtn.addEventListener("click", () => {
    const inputMessageValue = inputMessage.value
    const msgData = {
      text: inputMessageValue,
      username: currentUsername,
      id: currentUserId
    }
    if (inputMessageValue) {
      // emit message to server
      socket.emit("chatMessages", msgData)

    }
  })
}




// --------- socket on event ---------------- 

socket.on("getMessage", message => {
  appendFriendsMessage(message)
  chatScrollBar.scrollTop = chatScrollBar.scrollHeight
})

socket.on("sendMessage", message => {
  appendMyMessage(message)

  // store my message into database
  storeMessageAPI()
  async function storeMessageAPI() {
    const response = await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: message.userId,
        messageText: message.message,
        chatroomId: "63d2147931fb09bc0dd8ff9a", //まだ
        sentTime: message.time
      })
    })
  }
})


// ----------- display my message ----------- 

function appendMyMessage(msg) {
  chatMessageBox.innerHTML += `              
    <div class="sender-info">
      <div class="sender-name">You</div>
      <div class="sending-time">${msg.time}</div>
    </div>
    <div class="sender-bubble bubble">${msg.message}</div>
  `
  chatScrollBar.scrollTop = chatScrollBar.scrollHeight
  inputMessage.value = ""
}

// ---------- display friend's message ----------- 

function appendFriendsMessage(msg) {
  chatMessageBox.innerHTML += `
    <div class="receiver-info">
      <div class="receiver-name">${msg.username}</div>
      <div class="receiving-time">${msg.time}</div>
    </div>
    <div class="receiver-bubble bubble">${msg.message}</div>
  `
}


// ---------- display history messages ----------

function clickChatList(senderId) {

  // chatroom avatar and name
  const chatBoxTopBarAvatar = document.querySelector("#chatbox-top-bar-avatar")
  const chatBoxTopBarName = document.querySelector("#chatbox-top-bar-name")

  // chatroom messages
  chatListScrollbar.addEventListener("click", (event) => {

    const roomId = event.target.dataset.id
    if (!roomId) return

    displayHistoryMessages(roomId)
    fetchChatroomAPI(roomId)

    async function displayHistoryMessages(roomId) {
      const response = await fetch(`/api/message/${roomId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })

      const jsonData = await response.json()

      if (jsonData.data) {
        // if there're already messages in the box, stop rendering history messages.
        if (chatMessageBox.childElementCount) return

        jsonData.data.forEach((data) => {
          const historyMessage = {
            userId: data.sender._id,
            username: data.sender.name,
            message: data.message_text,
            time: data.sent_time
          }

          if (data.sender._id === senderId) {
            appendMyMessage(historyMessage)
          } else {
            appendFriendsMessage(historyMessage)
          }
        })
      } else {
        chatMessageBox.innerHTML = "沒有任何訊息"
      }

    }

    async function fetchChatroomAPI(roomId) {
      const response = await fetch(`/api/chatroom?chatroomId=${roomId}`)

      const jsonData = await response.json()
      let friendName
      jsonData.data[0].participants.forEach((value) => {
        if (value._id !== senderId) {
          friendName = value.name
        }
      })
      chatBoxTopBarAvatar.innerHTML = `<p>${friendName[0]}</p>`
      chatBoxTopBarName.textContent = friendName
    }

  })

}

