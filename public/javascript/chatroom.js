const socket = io()
let currentFriendName
let currentFriendId
let currentFriendAvatar
let currentRoomId
const greetingMyName = document.querySelector("#greeting-my-name")
const homeMyName = document.querySelector("#home-my-name")
const homeMyAvatar = document.querySelector("#home-my-avatar-url")
const settingsMyName = document.querySelector("#settings-my-name")
const settingsMyEmail = document.querySelector("#settings-my-email")
const settingsMyAvatar = document.querySelector("#settings-my-avatar")
const isTypingMessage = document.querySelector(".typing")
const emojiSelectorBtn = document.querySelector("#emoji-selector-btn")
const emojiSelector = document.querySelector(".emoji-selector")
const allEmojis = document.querySelectorAll(".emoji")
const emojiIcon = document.querySelector("#emoji-icon")
const chatListScrollbar = document.querySelector("#chat-list-scrollbar")

// ------- get user's info from JWT -------
const jwt = document.cookie
const parts = jwt.split(".")
const payload = JSON.parse(atob(parts[1]))
const currentUserId = payload.id
const currentUserEmail = payload.email
const currentUsername = payload.name
const currentUserAvatar = payload.avatarUrl

//  get user's info from db

getMyInfo()
async function getMyInfo() {
  const response = await fetch("/api/user/auth")
  const jsonData = await response.json()

  const currentId = jsonData.data.id
  const currentName = jsonData.data.name
  const currentEmail = jsonData.data.email
  const currentAvatar = jsonData.data.avatar_url
  const currentUserInfo = {
    currentId: jsonData.data.id,
    currentName: jsonData.data.name,
    currentEmail: jsonData.data.email,
    currentAvatar: jsonData.data.avatar_url
  }

  // current profile
  settingsMyName.value = currentName
  settingsMyEmail.value = currentEmail
  settingsMyAvatar.src = currentAvatar
  greetingMyName.textContent = currentName
  homeMyName.textContent = currentName
  homeMyAvatar.src = currentAvatar

  fetchChatListAPI(currentUserInfo)

  // ------- emit message to server ----------
  if (inputMessage) {
    emitMessageToServer(currentName, currentId)
  }

  getMyFriendRequest(currentId)
}

// ------------- get chat list ------------

async function fetchChatListAPI(senderInfo) {
  const currentId = senderInfo.currentId
  const currentName = senderInfo.currentName

  const response = await fetch("/api/chatroom", { method: "GET" })
  const jsonData = await response.json()

  let roomId
  let friendId
  let friendName
  let avatarUrl

  jsonData.data.forEach((data) => {
    roomId = data._id
    data.participants.forEach((value) => {
      if (value._id !== currentId) {
        friendId = value._id
        friendName = value.name
        avatarUrl = value.avatar_url
      }
    })

    const lastMessageDateTime = changeTimeFormat(data.last_message_time)
    const lastMessageDate = lastMessageDateTime[0]
    const date = lastMessageDate.split("-")[1] + "/" + lastMessageDate.split("-")[2]
    const lastMessageTime = lastMessageDateTime[1]

    const chatListData = {
      roomId: roomId,
      friendId: friendId,
      avatarUrl: avatarUrl,
      friendName: friendName,
      lastMessage: data.last_message,
      lastMessageTime, lastMessageTime
    }

    const result = chatListLayout(chatListData)
    chatListScrollbar.appendChild(result)
    if (chatListData) {
      const chatListDefault = document.querySelector("#chat-list-default")
      chatListDefault.style.display = "none"
    }

    const localDateTime = new Date()
    const currentDateTime = localDateTime.toISOString()
    const currentLocalDate = changeTimeFormat(currentDateTime)[0]

    if (lastMessageDate !== currentLocalDate) {
      if (!data.last_message_time) {
        document.querySelector(`[id="${roomId}"] .chat-list-last-message-time`).textContent = "New"
      } else {
        document.querySelector(`[id="${roomId}"] .chat-list-last-message-time`).textContent = `${date}`
      }
    }

    if (data.last_message === "photo") {
      document.querySelector(`[id="${roomId}"] .chat-list-last-message`).innerHTML = `
      <span class="ts-icon is-image-icon"></span> Photo`
    }

    socket.emit("newUser", { currentId, currentName })
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
      document.querySelector("#message-search-box").style.display = "none"

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
  handleMessageList(message)
  if (message.roomId === currentRoomId) {
    appendMessage(message)
    if (message.userId === currentUserId) {
      storeMessageToDB(message)
      storeLatestMessage(message)
    }
  }
})

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
        const localDateTime = new Date()
        const currentDateTime = localDateTime.toISOString()

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
          // ------- current local date & time ------
          socket.emit("chatMessages", msgData)
          socket.emit("typing", "not typing")
        }
      }


    }

    if (inputMessageValue) {
      const localDateTime = new Date()
      const currentDateTime = localDateTime.toISOString()

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
        const localDateTime = new Date()
        const currentDateTime = localDateTime.toISOString()

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
      const localDateTime = new Date()
      const currentDateTime = localDateTime.toISOString()

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

// --------- store latest message ---------
async function storeLatestMessage(message) {

  if (message.text) {
    await fetch("/api/chatroom", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatroomId: message.roomId,
        lastMessage: message.text,
        lastMessageDateTime: message.dateTime,
      })
    })
  } else {
    await fetch("/api/chatroom", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatroomId: message.roomId,
        lastMessage: "photo",
        lastMessageDateTime: message.dateTime,
      })
    })
  }

}

// ------ get chatroom information ---------

async function fetchChatroomAPI(roomId) {
  const response = await fetch(`/api/chatroom?chatroomId=${roomId}`)

  const jsonData = await response.json()

  jsonData.data.participants.forEach((value) => {
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
        <img src="./chatroom-default.png" style="width:450px; opacity:50%"/>
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

  const dateDivider = `<div class="ts-divider is-center-text ts-text is-small is-bold" style="color: var(--ts-gray-500); line-height:50px" id="${currentLocalDate}">${currentLocalDate}</div>`

  const dateExists = document.getElementById(`${currentLocalDate}`)
  if (!dateExists) {
    chatMessageBox.innerHTML += dateDivider
  }

  if (msg.userId === currentUserId) {
    if (msg.text) {
      const myTextMessage = getMyTextMessage(msg, currentLocalTime)
      chatMessageBox.appendChild(myTextMessage)
    } else {
      const myImageMessage = getMyImageMessage(msg, currentLocalTime)
      chatMessageBox.appendChild(myImageMessage)
    }
  } else {
    if (msg.text) {
      const friendTextMessage = getFriendTextMessage(msg, currentLocalTime)
      chatMessageBox.appendChild(friendTextMessage)
    } else {
      const friendImageMessage = getFriendImageMessage(msg, currentLocalTime)
      console.log(friendImageMessage)
      chatMessageBox.appendChild(friendImageMessage)
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

// handle message list
function handleMessageList(message) {

  const messageText = message.text
  const roomId = message.roomId
  const messageDateTime = changeTimeFormat(message.dateTime)

  // message list
  const lastMessage = document.querySelector(`[id=
    "${roomId}"] .chat-list-last-message`)

  const lastMessageTime = document.querySelector(`[id=
    "${roomId}"] .chat-list-last-message-time`)

  if (messageText) {
    lastMessage.textContent = messageText
  } else {
    lastMessage.innerHTML = `<span class="ts-icon is-image-icon"></span> Photo`
  }

  lastMessageTime.textContent = messageDateTime[1]

  //move chat list box to the top one
  const chatListBox = document.querySelector(`[id="${roomId}"]`)
  chatListBox.remove()
  chatListScrollbar.prepend(chatListBox)

}


function changeTimeFormat(messageDateTime) {
  const dateTime = new Date(messageDateTime)
  const day = dateTime.getDate()
  const month = dateTime.getMonth() + 1
  const year = dateTime.getFullYear()
  const hour = dateTime.getHours()
  const minutes = dateTime.getMinutes()

  const currentLocalDate = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day)

  const currentLocalTime = (hour < 10 ? "0" + hour : hour) + ":" + (minutes < 10 ? "0" + minutes : minutes)

  return [currentLocalDate, currentLocalTime]
}
