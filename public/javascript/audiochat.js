// -------------- peer.js ----------------

const peer = new Peer(currentUserId, {
  secure: true,
  host: "0.peerjs.com",
  port: "443"
})

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
  displayIncomingCallPopup(audioCallInfo.callerAvatar, audioCallInfo.callerName, audioCallInfo.peerId)
  handleIncomingCall(audioCallInfo.callerAvatar, audioCallInfo.callerName, audioCallInfo.peerId)
})


// end call functionality 
const endCallBtn = document.querySelector("#end-call-btn")
endCallBtn.addEventListener("click", () => {

  const endCallData = {
    senderId: currentUserId,
    receiverId: currentFriendId,
    roomId: currentRoomId
  }
  socket.emit("endCall", endCallData)
})

function displayIncomingCallPopup(avatarUrl, name, senderId) {
  const ringtone = document.querySelector("#ringtone")
  const incomingCallPopup = document.querySelector(".incoming-call-popup")
  const callerAvatarUrl = document.querySelector("#caller-avatar-url")
  const callerName = document.querySelector(".caller-name")

  incomingCallPopup.classList.remove("display-none")
  incomingCallPopup.id = `incomingCall${senderId}`
  ringtone.play()
  callerAvatarUrl.attributes.src.value = `${avatarUrl}`
  callerName.textContent = `${name}`

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
    incomingCallPopup.classList.add("display-none")

    const ringtone = document.querySelector("audio")
    ringtone.pause()
    ringtone.currentTime = 0

    const incomingCallId = incomingCallPopup.id.split("incomingCall")[1]
    socket.emit("declineCall", { currentUserId, incomingCallId })

  })
}

// --------- handle audio ----------------

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
    const connection = peer.call(friendId, stream)

    socket.on("declineCall", (data) => {
      const audioConnectingPopup = document.querySelector(".audio-connecting-popup")
      audioConnectingPopup.classList.add("display-none")

      stream.getTracks().forEach((track) => {
        track.stop()
      })

      connection.close()
    })

    socket.on("endCallReceived", (data) => {
      const audioConnectingPopup = document.querySelector(".audio-connecting-popup")
      audioConnectingPopup.classList.add("display-none")
      stream.getTracks().forEach((track) => {
        track.stop()
      })

      connection.close()
    })

  } catch (error) {
    console.log(error)
  }
}


socket.on("endCallReceived", (data) => {
  const incomingCallPopup = document.querySelector(".incoming-call-popup")
  if (incomingCallPopup) {
    incomingCallPopup.classList.add("display-none")
    const ringtone = document.querySelector("audio")
    ringtone.pause()
    ringtone.currentTime = 0
  }

  const audioConnectingPopup = document.querySelector(".audio-connecting-popup")
  audioConnectingPopup.classList.add("display-none")
})

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
  const audioConnectingPopup = document.querySelector(".audio-connecting-popup")
  const audioConnectingAvatarUrl = document.querySelector("#audio-connecting-avatar-url")
  const connectingName = document.querySelector(".connecting-name")
  const connectingTime = document.querySelector(".connecting-time")

  audioConnectingPopup.classList.remove("display-none")
  audioConnectingAvatarUrl.attributes.src.value = `${friendAvatar}`
  connectingName.textContent = `${friendName}`
}
