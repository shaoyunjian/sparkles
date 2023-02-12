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
    controlMicrophone(stream)

    // if sb tries to call us, answer their call and send them our stream
    peer.on("call", call => {
      call.answer(stream)

      const audio = document.createElement("audio")
      call.on("stream", remoteStream => {
        // "stream" is the MediaStream of the remote peer.
        addAudioStream(audio, remoteStream)
        controlMicrophone(remoteStream)
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


// -------- mic controller ------------
function controlMicrophone(stream) {
  const muteBtn = document.querySelector("#mute-btn")
  const unmuteBtn = document.querySelector("#unmute-btn")

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


// ------ audio connecting popup -------
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


