const userSearchBtn = document.querySelector("#user-search-btn")
const userSearchModal = document.querySelector("#user-search-modal")
const userSearchModalCloseBtn = document.querySelector("#user-search-modal-close-btn")
const content = document.querySelector(".content")
const userSearchList = document.querySelector(".user-list")


userSearchBtn.addEventListener("click", () => {
  userSearchModal.classList.add("is-visible")
})

userSearchModalCloseBtn.addEventListener("click", () => {
  userSearchModal.classList.remove("is-visible")
})

document.addEventListener("click", (event) => {
  if (event.target.id === "user-search-modal") {
    userSearchModal.classList.remove("is-visible")
  }
})


// ----------- search users -----------

const userSearchBar = document.querySelector("#user-search-bar")
userSearchBar.addEventListener("input", () => {
  const inputValue = userSearchBar.value
  if (!inputValue) {
    userSearchList.innerHTML = `
    <img src="/people-search2.png" style="height: 220px; opacity: 40%;">` }
  searchUsersByKeyword(inputValue)

})

async function searchUsersByKeyword(data) {
  const response = await fetch(`/api/user?keyword=${data}`)

  const jsonData = await response.json()

  if (jsonData.data[0]) {
    userSearchList.innerHTML = ""

    jsonData.data.forEach((user) => {
      const userList = `
        <div class="ts-content is-dense">
            <div class="ts-row is-middle-aligned">
              <div class="column">
                <div class="ts-avatar is-circular is-large">
                  <img src="${user.avatar}" />
                </div>
              </div>
              <div class="column">
                <div class="ts-text is-bold is-large  is-start-aligned"
                  style="width: 150px; overflow:hidden;white-space: nowrap; text-overflow: ellipsis;">
                  ${user.name}</div>
              </div>
              <div class="column friend-request-btns" id="friendRequest${user.id}">
              </div>
            </div>
          </div>
          <div class="ts-divider"></div>
      `

      userSearchList.innerHTML += userList

      const friendRequestBtn = document.getElementById(`friendRequest${user.id}`)

      if (friendRequestBtn) {
        if (user.id === currentUserId) {// myself
          friendRequestBtn.innerHTML = `
            <button class="friend-request-btn you">You</button>
          `
        } else {
          fetchRequestStatusAPI(user.id)
        }
      }

    })
  } else {
    userSearchList.innerHTML = `
    <div class="ts-content ts-text is-center-aligned">
      User not found
      <span class="ts-icon is-user-astronaut-icon"></span><br/>
      Please check your spelling.
    </div>`
  }

}

async function fetchRequestStatusAPI(friendId) {
  const response = await fetch(`/api/friendRequest?friendId=${friendId}`)
  const jsonData = await response.json()

  if (!jsonData.data.length) {
    // console.log("not friend yet")
    let data = { statusCode: 0 }
    checkRequestStatus(data, friendId)
  } else {
    jsonData.data.forEach((data) => {
      checkRequestStatus(data, friendId)
    })
  }

}

function checkRequestStatus(data, friendId) {
  const friendRequestBtn = document.getElementById(`friendRequest${friendId}`)

  if (data.statusCode === 1) {
    if (data.requesterId._id === currentUserId) {
      // request sent, waiting for reply.

      friendRequestBtn.innerHTML = `
      <button class="friend-request-btn requested">Requested</button>`

    } else if (data.receiverId._id === currentUserId) {
      // request received, not replied yet.

      friendRequestBtn.innerHTML = `
      <button class="friend-request-btn request-confirm-btn" id="friendRequestConfirm${friendId}">Accept</button>
      <button class="friend-request-btn request-decline-btn" id="friendRequestDecline${friendId}">Delete</button>`

      handleFriendRequest(friendId)
    }
  }


  // not friends
  if (data.statusCode === 0) {
    friendRequestBtn.innerHTML = `
      <button class="friend-request-btn add" id="friendRequestAdd${friendId}">Add Friend</button>`

    handleFriendRequest(friendId)
  }

  // are friends
  if (data.statusCode === 2) {
    friendRequestBtn.innerHTML = `
      <button class="friend-request-btn friend">Friend</button>`
  }

}

function handleFriendRequest(friendId) {
  const friendRequestBtn = document.getElementById(`friendRequest${friendId}`)
  const friendRequestAddBtn = document.getElementById(`friendRequestAdd${friendId}`)
  const friendRequestConfirmBtn = document.getElementById(`friendRequestConfirm${friendId}`)
  const friendRequestDeclineBtn = document.getElementById(`friendRequestDecline${friendId}`)

  friendRequestBtn.addEventListener("click", (event) => {

    if (event.target === friendRequestAddBtn) {
      // click the add button to send friend request
      console.log("send request")
      sendFriendRequest(currentUserId, currentUsername, friendId, 1)
      friendRequestBtn.innerHTML = `
        <button class="friend-request-btn requested">Requested</button>`

    } else if (event.target === friendRequestConfirmBtn) {
      // click the accept button to accept request
      console.log("friendRequestConfirm")
      acceptFriendRequest(friendId, currentUserId, 2)
      addFriendToDB(currentUserId, friendId)
      addFriendToDB(friendId, currentUserId)
      create1to1Chatroom(currentUserId, friendId)

      friendRequestBtn.innerHTML = `
        <button class="friend-request-btn friend">Friend</button>`

    } else if (event.target === friendRequestDeclineBtn) {
      // click the delete button to decline and delete request
      console.log("friendRequestDecline")
      deleteFriendRequest(friendId, currentUserId)
      friendRequestBtn.innerHTML = `
        <button class="friend-request-btn add" id="friendRequest${friendId}">Add Friend</button>`
    }
  })
}

async function sendFriendRequest(requesterId, requesterName, receiverId, statusCode) {
  const response = await fetch("/api/friendRequest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requesterId: requesterId,
      requesterName: requesterName,
      receiverId: receiverId,
      friendRequestCode: statusCode
    })
  })

  // const jsonData = await response.json()
  // console.log(jsonData)

  const request = {
    requesterId: requesterId,
    requesterName: requesterName,
    receiverId: receiverId,
    type: "request-sent"
  }
  socket.emit("friendRequest", request)
}

async function acceptFriendRequest(friendId, myId, statusCode) {
  const response = await fetch("/api/friendRequest", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requesterId: friendId,
      receiverId: myId,
      friendRequestCode: statusCode
    })
  })

  //   const jsonData = await response.json()
  //   console.log(jsonData)

  const request = {
    requesterId: myId,
    requesterName: currentUsername,
    receiverId: friendId,
    type: "request-accepted"
  }
  socket.emit("friendRequest", request)
}

async function deleteFriendRequest(friendId, myId, statusCode) {
  const response = await fetch("/api/friendRequest", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requesterId: friendId,
      receiverId: myId,
      friendRequestCode: statusCode
    })
  })

  // const jsonData = await response.json()
  // console.log(jsonData)
}

// ---------- add friend -------------
async function addFriendToDB(userId, friendId) {
  const response = await fetch("/api/friend", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      friendId: friendId,
    })
  })

  // const jsonData = await response.json()
  // console.log(jsonData)
}

// ----- create 1 to 1 chatroom ------
async function create1to1Chatroom(sender, receiver) {
  const participants = [sender, receiver]
  const response = await fetch("/api/chatroom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participants: participants
    })
  })

  const jsonData = await response.json()

  if (jsonData.ok) {
    console.log("Created successfully")
  } else if (jsonData.message === "Chatroom already exists") {
    console.log("Chatroom already exists")
  }
}

// ------ display friend list --------
// getFriendList() // currently hidden
async function getFriendList() {
  const response = await fetch("/api/friend")
  const jsonData = await response.json()

  const friendList = document.querySelector(".friend-list")
  jsonData.data.forEach((data) => {
    friendList.innerHTML += `
        <div class="ts-content is-dense">
          <div class="ts-row is-middle-aligned is-evenly-divided">
            <div class="column">
              <div class="ts-avatar is-circular is-large">
                <img src="${data.avatar_url}">
              </div>
            </div>
            <div class="column">
              <div class="ts-text is-bold is-large is-center-aligned">${data.name}</div>
            </div>
            <div class="column">
              <div class="column">
                <button class="friend-request-btn chat">
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="ts-divider"></div>
    `
  })
}
