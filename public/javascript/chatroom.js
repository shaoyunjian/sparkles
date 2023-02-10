// ------- get user's info from JWT -------
const jwt = document.cookie
const parts = jwt.split(".");
const payload = JSON.parse(atob(parts[1]))
const currentUserId = payload.id
const currentUsername = payload.name
const currentUserEmail = payload.email
const currentUserAvatar = payload.avatarUrl

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
let currentFriendName
let currentFriendId
let currentFriendAvatar
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
  chatBoxTopBarAvatar.innerHTML = `<p>${currentFriendName[0]}</p>`
  chatBoxTopBarName.textContent = currentFriendName
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

// --------------- peer.js ----------------

// create a new instance of the peer object from peer.js library
// const peer = new Peer(currentUserId) // run peerServer cloud

// undefined means that the library will automatically generate an ID for the peer.
// const peer = new Peer(currentUserId, { //run our own peerServer
//   host: "/",
//   port: "8081"
// })

const peer = new Peer(currentUserId, {
  secure: true,
  host: "0.peerjs.com",
  port: "443"
})

console.log("peerId", peer.id)

const audioChatArea = document.querySelector("#audio-chat")
const myAudio = document.createElement("audio")
myAudio.muted = true //avoid echos from ourselves


// ------------ audio call ----------------
const main = document.querySelector("main")
const audioCallBtn = document.querySelector("#audio-call-btn")

// call the other peer
audioCallBtn.addEventListener("click", () => {

  const audioCallSenderData = {
    callerName: currentUsername,
    callerId: currentUserId,
    callerAvatar: currentUserAvatar,
    receiverId: currentFriendId,
    receiverName: currentFriendName,
    receiverAvatar: currentFriendAvatar,
    roomId: currentRoomId
  }
  socket.emit("audioCallPopup", audioCallSenderData)

  // call friend peer
  const friendId = audioCallSenderData.receiverId
  const friendName = audioCallSenderData.receiverName
  getAudio(friendId)
  addAudioConnectingPopup(currentFriendAvatar, friendName)
})

socket.on("incomingCallPopup", (audioCallInfo) => {
  console.log("audioCallInfo", audioCallInfo)
  displayIncomingCallPopup(audioCallInfo.callerAvatar, audioCallInfo.callerName)
  handleIncomingCall(audioCallInfo.callerAvatar, audioCallInfo.callerName, audioCallInfo.peerId)
})


function displayIncomingCallPopup(avatarUrl, name) {
  const popup = `
    <div class="incoming-call-popup">
      <audio autoplay loop>
        <source src="https://d1gnt5bnf8w529.cloudfront.net/ringtone.wav" type="audio/wav">
      </audio>
      <div class="caller-avatar">
        <img src="${avatarUrl}">
      </div>
      <div class="caller-name">${name}</div>
      <div class="incoming-call-description">Incoming call...</div>
      <div class="incoming-call-icons">
        <i class="fas fa-phone" id="accept-call-btn"></i>
        <i class="fas fa-phone" id="decline-call-btn"></i>
      </div>
    </div>
    `
  main.innerHTML += popup
}

function handleIncomingCall(avatarUrl, name, friendId) {
  const incomingCallPopup = document.querySelector(".incoming-call-popup")
  const acceptCallBtn = document.querySelector("#accept-call-btn")
  const declineCallBtn = document.querySelector("#decline-call-btn")

  acceptCallBtn.addEventListener("click", () => {
    incomingCallPopup.remove()

    // receive the audio call
    addAudioConnectingPopup(avatarUrl, name)
    getAudio(friendId)
  })

  declineCallBtn.addEventListener("click", () => {
    console.log("拒絕")
    incomingCallPopup.remove()
    socket.emit("decline-call")
    window.location = window.location.href
  })
}

// -----------  ----------------

async function getAudio(friendId) {

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    })

    // add my audio stream
    addAudioStream(myAudio, stream)

    // if sb tries to call us, answer their call and send them our stream
    peer.on("call", call => {
      call.answer(stream)

      const audio = document.createElement("audio")
      call.on("stream", userAudioStream => {
        // "stream" is the MediaStream of the remote peer.
        addAudioStream(audio, userAudioStream)
      })
    })

    // call a peer with the peer ID of the destination peer, providing our mediaStream
    peer.call(friendId, stream)

  } catch (error) {
    console.log(error)
  }
}

// XX
// socket.on("userDisconnected", peerId => {
//   if (peers[peerId]) {
//     peers[peerId].close()
//   }
// })


// peer.on("open", peerId => {
//   socket.emit("joinAudioChat", { currentRoomId, peerId })
// })


function addAudioStream(audio, stream) {
  //The value of srcObject can be set to a MediaStream object, which represents a stream of audio data. 
  audio.srcObject = stream
  audio.addEventListener("loadedmetadata", () => {
    audio.play()
  })
}


// -------- mic controlling------------
const muteBtn = document.querySelector("#mute-btn")
const unmuteBtn = document.querySelector("#unmute-btn")

function controlMicrophone(stream) {
  const audioTrack = stream.getAudioTracks().find(track => track.kind === "audio")

  // mute the mic
  if (unmuteBtn) {
    unmuteBtn.addEventListener("click", () => {
      unmuteBtn.classList.add("display-none")
      muteBtn.classList.remove("display-none")
      audioTrack.enabled = false
    })
  }

  // unmute the mic
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      muteBtn.classList.add("display-none")
      unmuteBtn.classList.remove("display-none")
      audioTrack.enabled = true
    })
  }
}


// audio connecting popup
function addAudioConnectingPopup(friendAvatar, friendName) {
  const popup = `
    <div class="audio-connecting-popup">
      <div class="audio-connecting-avatar">
        <img src="${friendAvatar}">
        <i class="fas fa-microphone-slash display-none"></i>
      </div>
      <div class="caller-name">${friendName}</div>
      <div class="incoming-call-description">Audio connecting...</div>
      <div class="incoming-call-description">0:00</div>
      <div class="incoming-call-icons">
        <i class="fas fa-microphone mute-unmute-toggle-btn" id="unmute-btn"></i>
        <i class="fas fa-microphone-slash mute-unmute-toggle-btn display-none" id="mute-btn"></i>
        <i class="fas fa-phone" id="end-call-btn"></i>
      </div>
    </div>
  `

  main.innerHTML += popup

}

// click button to mute/unmute the mic
// !! doesn't work now
// controlMicrophone(stream)