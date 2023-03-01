const getMyTextMessage = function (msg, currentLocalTime) {
  const myTextMessage = document.createElement("div")
  myTextMessage.classList.add("sender-message")
  myTextMessage.id = `${msg.dateTime}`

  const senderBubbleBox = document.createElement("div")
  senderBubbleBox.classList.add("sender-bubble-box")

  const senderTime = document.createElement("div")
  senderTime.classList.add("sending-time", "message-arrived-time")
  senderTime.innerText = `${currentLocalTime}`

  const senderBubble = document.createElement("div")
  senderBubble.classList.add("sender-bubble", "bubble")
  senderBubble.innerText = `${msg.text}`

  senderBubbleBox.appendChild(senderTime)
  senderBubbleBox.appendChild(senderBubble)
  myTextMessage.appendChild(senderBubbleBox)

  return myTextMessage
}

const getFriendTextMessage = function (msg, currentLocalTime) {
  const friendTextMessage = document.createElement("div")
  friendTextMessage.classList.add("receiver-message")
  friendTextMessage.id = `${msg.dateTime}`

  const receiverAvatarDiv = document.createElement("div")
  receiverAvatarDiv.classList.add("receiver-avatar")
  const imgDiv = document.createElement("div")
  imgDiv.classList.add("ts-avatar", "is-circular")
  const receiverAvatarImg = document.createElement("img")
  receiverAvatarImg.src = `${msg.avatarUrl}`

  imgDiv.appendChild(receiverAvatarImg)
  receiverAvatarDiv.appendChild(imgDiv)
  friendTextMessage.appendChild(receiverAvatarDiv)

  const receiverNameBubble = document.createElement("div")
  receiverNameBubble.classList.add("receiver-name-bubble")

  const receiverName = document.createElement("div")
  receiverName.classList.add("receiver-name")
  receiverName.innerText = `${msg.username}`

  const receiverBubbleBox = document.createElement("div")
  receiverBubbleBox.classList.add("receiver-bubble-box")

  const receiverBubble = document.createElement("div")
  receiverBubble.classList.add("receiver-bubble", "bubble")
  receiverBubble.innerText = `${msg.text}`

  const receiverTime = document.createElement("div")
  receiverTime.classList.add("receiving-time", "message-arrived-time")
  receiverTime.innerText = `${currentLocalTime}`

  receiverBubbleBox.appendChild(receiverBubble)
  receiverBubbleBox.appendChild(receiverTime)
  receiverNameBubble.appendChild(receiverName)
  receiverNameBubble.appendChild(receiverBubbleBox)

  friendTextMessage.appendChild(receiverNameBubble)

  return friendTextMessage
}

const getMyImageMessage = function (msg, currentLocalTime) {
  const myImageMessage = document.createElement("div")
  myImageMessage.classList.add("sender-message")
  myImageMessage.id = `${msg.dateTime}`

  const senderBubbleBox = document.createElement("div")
  senderBubbleBox.classList.add("sender-bubble-box")

  const senderTime = document.createElement("div")
  senderTime.classList.add("sending-time", "message-arrived-time")
  senderTime.innerText = `${currentLocalTime}`

  const senderBubbleImgDiv = document.createElement("div")
  senderBubbleImgDiv.classList.add("ts-image", "is-rounded", "is-medium", "is-bordered")
  const senderBubbleImg = document.createElement("img")
  senderBubbleImg.classList.add("chat-image")
  senderBubbleImg.src = `${msg.imageUrlMessage}`

  senderBubbleImgDiv.appendChild(senderBubbleImg)
  senderBubbleBox.appendChild(senderTime)
  senderBubbleBox.appendChild(senderBubbleImgDiv)
  myImageMessage.appendChild(senderBubbleBox)

  return myImageMessage
}

const getFriendImageMessage = function (msg, currentLocalTime) {
  const friendImageMessage = document.createElement("div")
  friendImageMessage.classList.add("receiver-message")
  friendImageMessage.id = `${msg.dateTime}`

  const receiverAvatarDiv = document.createElement("div")
  receiverAvatarDiv.classList.add("receiver-avatar")
  const imgDiv = document.createElement("div")
  imgDiv.classList.add("ts-avatar", "is-circular")
  const receiverAvatarImg = document.createElement("img")
  receiverAvatarImg.src = `${msg.avatarUrl}`

  imgDiv.appendChild(receiverAvatarImg)
  receiverAvatarDiv.appendChild(imgDiv)
  friendImageMessage.appendChild(receiverAvatarDiv)

  const receiverNameBubble = document.createElement("div")
  receiverNameBubble.classList.add("receiver-name-bubble")

  const receiverName = document.createElement("div")
  receiverName.classList.add("receiver-name")
  receiverName.innerText = `${msg.username}`

  const receiverBubbleBox = document.createElement("div")
  receiverBubbleBox.classList.add("receiver-bubble-box")

  const receiverBubbleImgDiv = document.createElement("div")
  receiverBubbleImgDiv.classList.add("ts-image", "is-rounded", "is-medium", "is-bordered", "message-image")
  const receiverBubbleImg = document.createElement("img")
  receiverBubbleImg.classList.add("chat-image")
  receiverBubbleImg.src = `${msg.imageUrlMessage}`

  const receiverTime = document.createElement("div")
  receiverTime.classList.add("receiving-time", "message-arrived-time")
  receiverTime.innerText = `${currentLocalTime}`


  receiverBubbleImgDiv.appendChild(receiverBubbleImg)
  receiverBubbleBox.appendChild(receiverBubbleImgDiv)
  receiverBubbleBox.appendChild(receiverTime)
  receiverNameBubble.appendChild(receiverName)

  receiverNameBubble.appendChild(receiverBubbleBox)
  friendImageMessage.appendChild(receiverNameBubble)


  return friendImageMessage
}

const chatListLayout = function (info) {

  const chatListItems = document.createElement("div")
  chatListItems.classList.add("chat-list-items")
  chatListItems.id = `${info.roomId}`
  chatListItems.dataset.id = `${info.friendId}`

  const chatListItem = document.createElement("div")
  chatListItem.classList.add("ts-content", "is-dense", "chat-list-item")

  const chatListItemSecondLayer = document.createElement("div")
  chatListItemSecondLayer.classList.add("ts-row", "is-middle-aligned")

  const chatListAvatar = document.createElement("div")
  const chatListMiddleItem = document.createElement("div")
  const chatListRightItem = document.createElement("div")
  chatListAvatar.classList.add("column", "avatar")
  chatListMiddleItem.classList.add("column", "chat-list-middle-item")
  chatListRightItem.classList.add("column", "chat-list-right-item")

  const chatListAvatarItem = document.createElement("div")
  chatListAvatarItem.classList.add("ts-avatar", "is-circular", "is-large", "is-bordered")
  const chatListAvatarItemImage = document.createElement("img")
  chatListAvatarItemImage.src = `${info.avatarUrl}`

  const avatarDot = document.createElement("div")
  avatarDot.classList.add("avatar-badge")
  avatarDot.id = `${info.friendId}`

  const chatListFriendName = document.createElement("div")
  chatListFriendName.classList.add("ts-text", "is-bold", "chat-list-friend-name")
  chatListFriendName.innerText = `${info.friendName}`

  const chatListLastMessage = document.createElement("div")
  chatListLastMessage.classList.add("ts-text", "is-description", "chat-list-last-message")
  chatListLastMessage.innerText = `${info.lastMessage}`

  const chatListLastMessageTime = document.createElement("div")
  chatListLastMessageTime.classList.add("ts-text", "is-description", "is-tiny", "chat-list-last-message-time")
  chatListLastMessageTime.innerText = `${info.lastMessageTime}`

  const unreadCountBtn = document.createElement("div")
  unreadCountBtn.classList.add("unread-count-btn")
  const unreadCount = document.createElement("p")
  unreadCount.innerText = "9+"

  unreadCountBtn.appendChild(unreadCount)
  chatListRightItem.appendChild(chatListLastMessageTime)
  chatListRightItem.appendChild(unreadCountBtn)

  chatListMiddleItem.appendChild(chatListFriendName)
  chatListMiddleItem.appendChild(chatListLastMessage)

  chatListAvatarItem.appendChild(chatListAvatarItemImage)
  chatListAvatar.appendChild(chatListAvatarItem)
  chatListAvatar.appendChild(avatarDot)

  chatListItem.appendChild(chatListItemSecondLayer)
  chatListItemSecondLayer.appendChild(chatListAvatar)
  chatListItemSecondLayer.appendChild(chatListMiddleItem)
  chatListItemSecondLayer.appendChild(chatListRightItem)

  chatListItems.appendChild(chatListItem)

  return chatListItems
}