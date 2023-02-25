const socket = io()
let currentFriendName
let currentFriendId
let currentFriendAvatar
let currentRoomId
const isTypingMessage = document.querySelector(".typing")
const emojiSelectorBtn = document.querySelector("#emoji-selector-btn")
const emojiSelector = document.querySelector(".emoji-selector")
const allEmojis = document.querySelectorAll(".emoji")
const emojiIcon = document.querySelector("#emoji-icon")

// ------- get user's info from JWT -------
const jwt = document.cookie
const parts = jwt.split(".")
const payload = JSON.parse(atob(parts[1]))
const currentUserId = payload.id
const currentUsername = payload.name
const currentUserEmail = payload.email
const currentUserAvatar = payload.avatarUrl

// ------- current local date & time ------
const localDateTime = new Date()
const currentDateTime = localDateTime.toISOString()

// --------------- profile ----------------
const myAvatarUrl = document.querySelector("#my-avatar-url")
const myName = document.querySelectorAll(".my-name")
myAvatarUrl.src = currentUserAvatar

myName.forEach((name) => {
  name.textContent = currentUsername
})

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
      <div id="${roomId}" data-id="${friendId}" class="chat-list-items" >
        <div class="ts-content is-dense chat-list-item">
          <div class="ts-row is-middle-aligned">
            <div class="column avatar">
              <div class="ts-avatar is-circular is-large is-bordered">
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
    socket.emit("newUser", { currentUserId, currentUsername })
    checkOnlineStatus(friendId)

  })

  clickListToDisplayChatroom()

}

// ---------- render chatroom -------------

const welcomeBox = document.querySelector("#welcome-box")
const chatBox = document.querySelector("#chatbox")
const topBar = document.querySelector(".top-bar")
const chatBoxTopBarAvatar = document.querySelector("#chatbox-top-bar-avatar")
const chatBoxTopBarName = document.querySelector("#chatbox-top-bar-name")
const chatBoxAvatarBadge = document.querySelector(".chatbox-avatar-badge")

// click chat list to display chatroom
const clickListToDisplayChatroom = () => {
  const chatListItems = document.querySelectorAll("#chat-list-scrollbar .chat-list-items")

  chatListItems.forEach((chatListItem, index) => {
    chatListItem.addEventListener("click", () => {
      welcomeBox.style.display = "none"
      chatBox.style.display = "flex"
      isTypingMessage.style.display = "none"
      emojiSelector.classList.remove("is-visible")
      emojiIcon.classList.add("is-face-smile-icon")
      emojiIcon.classList.remove("is-chevron-down-icon")

      // active item
      const activeChatroom = document.querySelector("#chat-list-scrollbar .active")
      if (activeChatroom) {
        activeChatroom.classList.remove("active")
      }

      chatListItems[index].classList.add("active")
      currentRoomId = chatListItems[index].id

      // check online status
      const chatboxAvatarBadge = document.querySelector(".chatbox-avatar-badge")
      if (chatboxAvatarBadge) { chatboxAvatarBadge.classList.remove("online") }
      const friendId = chatListItems[index].dataset.id
      const avatarBadgeId = document.getElementById(`${friendId}`)
      if (avatarBadgeId.classList.value.includes("online")) {
        document.querySelector(".chatbox-avatar-badge").classList.add("online")
      }

      fetchChatroomAPI(currentRoomId)
      displayMessageHistory(currentRoomId)
    })
  })
}


// ------ 1 to 1 real-time chatroom --------

const chatMessageBox = document.querySelector(".chat-message-box")
const chatScrollBar = document.querySelector(".middle-scollbar")
const sendMessageBtn = document.querySelector("#send-message-btn")
const inputMessage = document.querySelector("#input-message")

// socket.emit("newUser", { currentUserId, currentUsername })

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

// --------- upload images to s3 and display it ---------

const inputFile = document.querySelector("#input-file")
const imagePreloadArea = document.querySelector("#image-preload-area")
const imagePreloadImage = document.querySelector("#image-preload-image")
const inputFileResetBtn = document.querySelector("#input-file-reset-btn")

inputFile.addEventListener("change", (event) => {

  imagePreloadArea.style.display = "flex"
  imagePreloadImage.src = URL.createObjectURL(event.target.files[0])
  imagePreloadImage.onload = function () {
    URL.revokeObjectURL(imagePreloadImage.src) // free memory
  }

  inputFileResetBtn.addEventListener("click", () => {
    closeImagePreloadArea()
  })

  const chatListItem = document.querySelectorAll(".chat-list-item")
  chatListItem.forEach((chatList) => {
    chatList.addEventListener("click", () => {
      closeImagePreloadArea()
    })
  })

})

function closeImagePreloadArea() {
  inputFile.value = ""
  imagePreloadArea.style.display = "none"
}

function emitMessageToServer(currentUsername, currentUserId) {

  inputMessage.addEventListener("keypress", (event) => {
    const inputMessageValue = inputMessage.value
    const image = inputFile.files[0]
    if (image) {
      getUploadedImageUrl()

      async function getUploadedImageUrl() {
        let formData = new FormData()
        formData.append("image", image)

        const response = await fetch("/api/file", {
          method: "POST",
          body: formData
        })

        const jsonData = await response.json()
        const messageImageUrl = jsonData.data

        const msgData = {
          text: null,
          dateTime: currentDateTime,
          imageUrlMessage: messageImageUrl,
          username: currentUsername,
          userId: currentUserId,
          avatarUrl: currentUserAvatar,
          roomId: currentRoomId,
          receiverId: currentFriendId,
        }

        if (event.key === "Enter") {
          socket.emit("chatMessages", msgData)
          socket.emit("typing", "not typing")
        }
      }


    }

    if (inputMessageValue) {
      const msgData = {
        text: inputMessageValue,
        dateTime: currentDateTime,
        imageUrlMessage: null,
        username: currentUsername,
        userId: currentUserId,
        avatarUrl: currentUserAvatar,
        roomId: currentRoomId,
        receiverId: currentFriendId,
      }
      if (event.key === "Enter") {
        socket.emit("chatMessages", msgData)
        socket.emit("typing", "not typing")
      }
    }

    handleEmojiSelector("close")
    closeImagePreloadArea()
  })

  sendMessageBtn.addEventListener("click", () => {
    const inputMessageValue = inputMessage.value
    const image = inputFile.files[0]
    if (image) {
      getUploadedImageUrl()

      async function getUploadedImageUrl() {
        let formData = new FormData()
        formData.append("image", image)

        const response = await fetch("/api/file", {
          method: "POST",
          body: formData
        })

        const jsonData = await response.json()
        const messageImageUrl = jsonData.data

        const msgData = {
          text: null,
          dateTime: currentDateTime,
          imageUrlMessage: messageImageUrl,
          username: currentUsername,
          userId: currentUserId,
          avatarUrl: currentUserAvatar,
          roomId: currentRoomId,
          receiverId: currentFriendId,
        }

        socket.emit("chatMessages", msgData)
        socket.emit("typing", "not typing")
      }
    }

    if (inputMessageValue) {
      const msgData = {
        text: inputMessageValue,
        dateTime: currentDateTime,
        imageUrlMessage: null,
        username: currentUsername,
        userId: currentUserId,
        avatarUrl: currentUserAvatar,
        roomId: currentRoomId,
        receiverId: currentFriendId,
      }

      socket.emit("chatMessages", msgData)
      socket.emit("typing", "not typing")
    }

    handleEmojiSelector("close")
    closeImagePreloadArea()
  })

}

// ---- store my message into database -----
async function storeMessageToDB(message) {

  const response = await fetch("/api/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId: message.userId,
      messageText: message.text,
      messageImageUrl: message.imageUrlMessage,
      chatroomId: message.roomId,
      sentTime: message.dateTime
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
  chatBoxAvatarBadge.id = `status${currentFriendId}`

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
        text: data.message_text,
        imageUrlMessage: data.image_url,
        dateTime: data.sent_time
      }

      appendMessage(historyMessage)
    })
  } else {
    chatMessageBox.innerHTML = `
      <div style="display:flex; justify-content: center; align-items: center;">
        <img src="./Connected-world-pana.png" style="width:500px; opacity:50%"/>
      </div>
    `
  }
}

// --------- append message bubble --------

function appendMessage(msg) {
  const dateTime = new Date(msg.dateTime)
  const day = dateTime.getDate()
  const month = dateTime.getMonth() + 1
  const year = dateTime.getFullYear()
  const hour = dateTime.getHours()
  const minutes = dateTime.getMinutes()

  const currentLocalDate = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day)

  const currentLocalTime = (hour < 10 ? "0" + hour : hour) + ":" + (minutes < 10 ? "0" + minutes : minutes)

  const myTextMessage = `
    <div class="sender-message">
      <div class="sender-name"></div>
      <div class="sender-bubble-box">
        <div class="sending-time">${currentLocalTime}</div>
        <div class="sender-bubble bubble">${msg.text}</div>
      </div>
    </div>
  `
  const friendTextMessage = `
    <div class="receiver-message">
      <div class="receiver-avatar">
        <div class="ts-avatar is-circular">
          <img src="${msg.avatarUrl}">
        </div>
      </div>
      <div class="receiver-name-bubble">
        <div class="receiver-name">${msg.username}</div>
        <div class="receiver-bubble-box">
          <div class="receiver-bubble bubble">${msg.text}</div>
          <div class="receiving-time">${currentLocalTime}</div>
        </div>
      </div>
    </div>
  `

  const myImageMessage = `
    <div class="sender-message">
      <div class="sender-name"></div>
      <div class="sender-bubble-box">
        <div class="sending-time">${currentLocalTime}</div>
        <div class="ts-image is-rounded is-medium is-bordered">
          <img src="${msg.imageUrlMessage}" class="chat-image"/> 
        </div>
      </div>
    </div>
  `
  const friendImageMessage = `
    <div class="receiver-message">
      <div class="receiver-avatar">
        <div class="ts-avatar is-circular">
          <img src="${msg.avatarUrl}">
        </div>
      </div>
      <div class="receiver-name-bubble">
        <div class="receiver-name">${msg.username}</div>
        <div class="receiver-bubble-box">
          <div class="ts-image is-rounded is-medium is-bordered message-image">
            <img src="${msg.imageUrlMessage}" class="chat-image"/> 
          </div>
          <div class="receiving-time">${currentLocalTime}</div>
        </div>
      </div>
    </div>
  `
  const dateDivider = `<div class="ts-divider is-center-text ts-text is-small is-bold" style="color: var(--ts-gray-500); line-height:50px" id="${currentLocalDate}">${currentLocalDate}</div>`

  const dateExists = document.getElementById(`${currentLocalDate}`)
  if (!dateExists) {
    chatMessageBox.innerHTML += dateDivider
  }

  if (msg.userId === currentUserId) {
    if (msg.text) {
      chatMessageBox.innerHTML += myTextMessage
    } else {
      chatMessageBox.innerHTML += myImageMessage
    }
  } else {
    if (msg.text) {
      chatMessageBox.innerHTML += friendTextMessage
    } else {
      chatMessageBox.innerHTML += friendImageMessage
    }
  }

  chatScrollBar.scrollTop = chatScrollBar.scrollHeight
  inputMessage.value = ""
  clickToDisplayChatImage()
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

// -------------- emoji selector --------------

emojiSelectorBtn.addEventListener("click", () => {
  toggleEmojiIcon()
})

allEmojis.forEach((emoji, index) => {
  emoji.addEventListener("click", () => {
    inputMessage.value += allEmojis[index].textContent
  })
})

function toggleEmojiIcon() {
  emojiSelector.classList.toggle("is-visible")
  emojiIcon.classList.toggle("is-face-smile-icon")
  emojiIcon.classList.toggle("is-chevron-down-icon")
}

function handleEmojiSelector(action) {
  if (action === "open") {
    emojiSelector.classList.add("is-visible")
    emojiIcon.classList.remove("is-face-smile-icon")
    emojiIcon.classList.add("is-chevron-down-icon")
  } else if (action === "close") {
    emojiSelector.classList.remove("is-visible")
    emojiIcon.classList.add("is-face-smile-icon")
    emojiIcon.classList.remove("is-chevron-down-icon")
  }
}

// ---------- online/offline status -----------

const avatarBadge = document.querySelector(".avatar-badge")
avatarBadge.classList.add("online")

function checkOnlineStatus(friendId) {
  socket.on("newUser", (onlineUsersId) => {
    onlineUsersId.forEach((onlineUserId) => {
      const friendOnlineStatus = document.getElementById(`${friendId}`)

      if (onlineUserId === friendId) {
        friendOnlineStatus.classList.add("online")

        const chatroomAvatarBadge = document.getElementById(`status${friendId}`)
        if (chatroomAvatarBadge) {
          chatroomAvatarBadge.classList.add("online")
        }
      }

    })
  })

}

socket.on("userDisconnected", (id) => {
  const friendOnlineStatus = document.getElementById(`${id}`)
  if (friendOnlineStatus) {
    friendOnlineStatus.classList.remove("online")
  }

  const chatroomAvatarBadge = document.getElementById(`status${id}`)
  if (chatroomAvatarBadge) {
    chatroomAvatarBadge.classList.remove("online")
  }
})


// -------- display image after clicking --------

function clickToDisplayChatImage() {
  const chatImageDisplayArea = document.querySelector("#chat-image-display-area")
  const chatImage = document.querySelector("#chat-image-display-area img")
  const chatImages = document.querySelectorAll(".chat-image")

  chatImages.forEach((image) => {
    image.onclick = () => {
      chatImageDisplayArea.classList.add("is-visible")
      chatImage.src = image.src

      chatImageDisplayArea.onclick = () => {
        chatImageDisplayArea.classList.remove("is-visible")
      }
    }
  })

}