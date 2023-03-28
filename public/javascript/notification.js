const notificationBtn = document.querySelector("#notification-btn")
const notificationModal = document.querySelector("#notification-modal")
const notificationModalCloseBtn = document.querySelector("#notification-modal-close-btn")
const notificationList = document.querySelector("#notification-list")
const notificationBadge = document.querySelector("#notification-btn .notification-badge")

notificationBtn.onclick = () => {
  notificationModal.classList.add("is-visible")
  getMyFriendRequest(currentUserId)
  notificationBadge.style.display = "none"
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
            <div class="ts-text is-tiny is-start-aligned"
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
      acceptFriendRequest(friendId, currentUserId, 2)
      addFriendToDB(currentUserId, friendId)
      addFriendToDB(friendId, currentUserId)
      create1to1Chatroom(currentUserId, friendId)

      friendRequestBtn.innerHTML = `
        <button class="friend-request-btn friend">Friend</button>`

      notificationBadge.style.display = "none"

    } else if (event.target === friendRequestDeclineBtn) {
      // click the delete button to decline and delete request

      deleteFriendRequest(friendId, currentUserId)
      friendRequestBtn.innerHTML = `
        <button class="friend-request-btn you">Deleted</button>`

      notificationBadge.style.display = "none"
    }
  })
}

socket.on("requestSended", (name) => {
  notificationBadge.style.display = "block"
  getMyFriendRequest(currentUserId)
  toastr.info("sent you a friend request!", `${name}`)
})

socket.on("requestAccepted", (request) => {
  toastr.info("accepted your friend request!", `${JSON.parse(request).requesterName}`)

  fetchChatListAPI(currentUserId)
})

socket.on("requestAcceptedAppendNewChatList", () => {
  window.location = window.location.href
})


// ---------- toast message ---------- 

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": true,
  "positionClass": "toast-top-right",
  "onclick": null,
  "showDuration": "500",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut",
  "rtl": false
}

