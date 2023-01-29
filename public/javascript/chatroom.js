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


// ------------- chat list -------------

const chatListScrollbar = document.querySelector("#chat-list-scrollbar")

fetchChatListAPI()
async function fetchChatListAPI() {
  const response = await fetch("/api/chatroom", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })

  const jsonData = await response.json()

  jsonData.data.forEach(data => {
    const friendName = data.participants[1].name

    chatListScrollbar.innerHTML += `
      <div class="message-box" id="${data.participants[1]._id}">
        <div class="avatar">S</div>
        <div class="name-message">
          <div class="name">${friendName}</div>
          <div class="message">${data.last_message}</div>
        </div>
        <div class="message-time">${data.last_message_time}</div>
      </div>
    `
  })

}

// ------------ get current user -----------------

// fetchCurrentUserAPI()
// async function fetchCurrentUserAPI() {
//   const response = await fetch("/api/user/auth", {
//     method: "GET",
//     headers: { "Content-Type": "application/json" }
//   })

//   const jsonData = await response.json()
//   currentUsername = jsonData.data.name
//   console.log(currentUsername)
// }



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


// displayHistoryMessages()
// async function displayHistoryMessages() {
//   const response = await fetch("/api/message", {
//     method: "GET",
//     headers: { "Content-Type": "application/json" }
//   })
// }
