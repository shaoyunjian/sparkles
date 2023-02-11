// -------- get user's info from JWT -------
const jwt = document.cookie
const parts = jwt.split(".");
const payload = JSON.parse(atob(parts[1]))
const currentUserId = payload.id
const currentUsername = payload.name
const currentUserEmail = payload.email
const currentUserAvatar = payload.avatarUrl

// -----------------------------------------
const friendSearchBar = document.querySelector("#friend-search-bar")
const userSearchList = document.querySelector(".user-search-list")
const friendList = document.querySelector(".friend-list")
const friendListInfoBox = document.querySelector("#friend-list-info-box")
const rightBox = document.querySelector(".right-box")


// --------- display friend list -----------
// ※※※ a tag (unfinished)

getFriendList()

async function getFriendList() {
  const response = await fetch("/api/friend")
  const jsonData = await response.json()

  jsonData.data.forEach((data) => {
    friendList.innerHTML += `
      <a href="/friendlist">
        <div class="chat-list-message-box">
          <div class="friend-list-avatar" id="friend-list-avatar">
            <img src="${data.avatar_url}">
          </div>
          <div class="friend-list-name" id="friend-list-name">${data.name}</div>
        </div>
      </a>
    `
  })
}

// ------------ user search --------------

friendSearchBar.addEventListener("input", () => {

  const inputValue = friendSearchBar.value

  searchUsers(inputValue)

})

async function searchUsers(data) {
  const response = await fetch(`/api/user?name=${data}&email=${data}`)

  const jsonData = await response.json()


  if (jsonData.data[0]) {
    userSearchList.innerHTML = ""

    jsonData.data.forEach((user) => {
      // myself(unfinished)
      if (jsonData.data[0].id === currentUserId) {
        const userContactBox = `
          <div class="chat-list-message-box" id="friend-list-info-box">
            <div class="friend-list-avatar">
              <img src="${user.avatar}" id="friend-list-avatar">
            </div>
            <div class="friend-list-name" id="friend-list-name">${user.name}</div>
          </div>
        `
        friendList.classList.add("display-none")
        userSearchList.innerHTML += userContactBox

        // click to popup request card
        document.querySelector("#friend-list-info-box").addEventListener("click", popupRequestCard)

      } else { // other users
        const userContactBox = `
          <div class="chat-list-message-box" id="friend-list-info-box">
            <div class="friend-list-avatar">
              <img src="${user.avatar}" id="friend-list-avatar">
            </div>
            <div class="friend-list-name" id="friend-list-name">${user.name}</div>
          </div>
        `
        friendList.classList.add("display-none")
        userSearchList.innerHTML += userContactBox

        // click to popup request card
        document.querySelector("#friend-list-info-box").addEventListener("click", popupRequestCard)
      }
    })
  } else {
    friendList.classList.add("display-none")
    userSearchList.innerHTML = `<div>User not found.</div>`
  }

  // if no value in input field
  if (!data) {
    userSearchList.innerHTML = ""
    friendList.classList.remove("display-none")
    rightBox.innerHTML = ""
  }
}

function popupRequestCard() {
  const name = document.querySelector("#friend-list-name")
  const avatar = document.querySelector("#friend-list-avatar")
  const avatarUrl = avatar.attributes.src.value

  rightBox.innerHTML = `
      <div class="add-friend-request-box">
        <div class="add-friend-request-friend-avatar">
          <img src="${avatarUrl}">
        </div>
        <div class="add-friend-request-friend-name">${name.textContent}</div>
        <div class="add-friend-request-btn">Add</div>
      </div>
    `

  const addFriendRequestBtn = document.querySelector(".add-friend-request-btn")
  addFriendRequestBtn.addEventListener("click", sendRequestToUser)
}





