const notificationBtn = document.querySelector("#notification-btn")
const notificationModal = document.querySelector("#notification-modal")
const notificationModalCloseBtn = document.querySelector("#notification-modal-close-btn")
const notificationList = document.querySelector("#notification-list")
const notificationBadge = document.querySelector("#notification-btn .notification-badge")

notificationBtn.onclick = () => {
  notificationModal.classList.add("is-visible")
}

notificationModalCloseBtn.onclick = () => {
  notificationModal.classList.remove("is-visible")
}

document.onclick = (event) => {
  if (event.target.id === "notification-modal") {
    notificationModal.classList.remove("is-visible")
  }
}


// ------ friend request notification ----------

getMyFriendRequest(currentUserId)
async function getMyFriendRequest(currentUserId) {
  const response = await fetch(`/api/friendRequest?currentUserId=${currentUserId}`)
  const jsonData = await response.json()


  // notification badge display/hidden
  if (jsonData.data[0]) {
    notificationBadge.style.display = "block"
  } else {
    notificationList.innerHTML = `<img src="/notification.png" style="height: 220px; opacity: 40%;">`
  }

  jsonData.data.forEach((data) => {
    notificationList.innerHTML = ""
    notificationList.innerHTML += `
      <div class="ts-content is-dense">
        <div class="ts-row is-middle-aligned">
          <div class="column">
            <div class="ts-avatar is-circular is-large">
              <img src="${data.requesterId.avatar_url}" />
            </div>
          </div>
          <div class="column">
            <div class="ts-text is-bold is-tiny is-start-aligned"
              style="width: 150px; overflow:hidden;white-space: nowrap; text-overflow: ellipsis; margin-bottom: -5px;">
              New friend request from
            </div>
            <div class="ts-text is-large is-start-aligned"
              style="width: 150px; overflow:hidden;white-space: nowrap; text-overflow: ellipsis;">
              ${data.requesterId.name}
            </div>
          </div>
          <div class="column friend-request-btns" id="friendRequest${data.requesterId._id}">
            <button class="friend-request-btn request-confirm-btn" id="friendRequestConfirm${data.requesterId._id}">
              Accept
            </button>
            <button class="friend-request-btn request-decline-btn" id="friendRequestDecline${data.requesterId._id}">
              Delete
            </button>
          </div>
        </div>
      </div>
      <div class="ts-divider"></div>
      `
    handleFriendRequestForNotification(data.requesterId._id)
  })
}

function handleFriendRequestForNotification(friendId) {
  const friendRequestBtn = document.getElementById(`friendRequest${friendId}`)
  const friendRequestConfirmBtn = document.getElementById(`friendRequestConfirm${friendId}`)
  const friendRequestDeclineBtn = document.getElementById(`friendRequestDecline${friendId}`)

  friendRequestBtn.addEventListener("click", (event) => {

    if (event.target === friendRequestConfirmBtn) {
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
        <button class="friend-request-btn you">Deleted</button>`
    }
  })
}
