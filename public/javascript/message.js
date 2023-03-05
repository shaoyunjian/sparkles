const messageSearchBtn = document.querySelector("#message-search-btn")
const messageSearchInputField = document.querySelector("#message-search-input-field")
const messageSearchInput = document.querySelector("#message-search-input")
const messageSearchCloseBtn = document.querySelector("#message-search-close-btn")
const messageHistoryDisplayBox = document.querySelector("#message-history-display-box")
const messageSearchBox = document.querySelector("#message-search-box")
const messageSearchDropdown = document.querySelector("#message-search-dropdown")
const messageHistoryDefaultBox = document.querySelector("#message-history-default-box")

messageSearchBtn.onclick = () => {
  messageSearchBox.style.display = messageSearchBox.style.display === "none" ? "flex" : "none"
  messageSearchInput.value = ""
  messageHistoryDisplayBox.innerText = ""
  document.querySelector("#message-search-copy").innerText = ""
  messageSearchDropdown.classList.remove("is-visible")
  messageHistoryDefaultBox.style.display = "block"
}

messageSearchCloseBtn.onclick = () => {
  messageSearchBox.style.display = "none"
  messageSearchInput.value = ""
  messageHistoryDisplayBox.innerText = ""
  document.querySelector("#message-search-copy").innerText = ""
  messageSearchDropdown.classList.remove("is-visible")
}

messageSearchInputField.addEventListener("keypress", (event) => {

  if (event.key === "Enter") {
    const inputValue = messageSearchInput.value.trim()
    getMessageHistoryByKeyword(currentRoomId, inputValue)
  }
})

messageSearchInputField.addEventListener("keyup", () => {
  const inputValue = messageSearchInput.value.trim()

  if (!inputValue) {
    messageSearchDropdown.classList.remove("is-visible")
    messageHistoryDefaultBox.style.display = "block"
    messageHistoryDisplayBox.innerText = ""
  }

  if (inputValue) {
    messageSearchDropdown.classList.add("is-visible")
    document.querySelector("#message-search-copy").innerText = inputValue
    messageSearchDropdown.onclick = () => {
      getMessageHistoryByKeyword(currentRoomId, inputValue)
      messageSearchDropdown.classList.remove("is-visible")
    }
  }
})


async function getMessageHistoryByKeyword(roomId, keyword) {
  if (!keyword) return

  const response = await fetch(`http://127.0.0.1:8080/api/message/${roomId}?messageKeyword=${keyword}`)
  const jsonData = await response.json()
  const resultCount = jsonData.data.length

  // clear history
  messageHistoryDisplayBox.innerText = ""
  messageHistoryDefaultBox.style.display = "none"

  if (jsonData.data[0]) {
    jsonData.data.forEach((value) => {
      const dateTime = changeTimeFormat(value.sent_time)

      const result = `
          <div class="ts-content history-message-item" data-id="${value.sent_time}">
            <div class="ts-row is-middle-aligned">
              <div class="column">
                <div class="ts-avatar is-circular is-bordered ">
                  <img src="${value.sender.avatar_url}">
                </div>
              </div>
              <div class="history-message-middle-item column">
                <div class="ts-text is-bold chat-list-friend-name">${value.sender.name}</div>
                <div class="ts-text is-description  history-message-content">${value.message_text}
                </div>
              </div>
              <div class="history-message-right-item column">
                <div class="ts-text is-description is-tiny history-message-date-time is-end-aligned">${dateTime[0]} ${dateTime[1]}
                </div>
              </div>
            </div>
          </div>
          <div class="ts-divider"></div>`

      messageHistoryDisplayBox.innerHTML += result
      messageSearchDropdown.classList.remove("is-visible")
    })

    const historyMessageItems = document.querySelectorAll(".history-message-item")

    historyMessageItems.forEach((historyMessageItem) => {
      historyMessageItem.onclick = () => {
        const messageHistoryTime = historyMessageItem.dataset.id
        const messageArrivedTime = document.querySelector(`[id='${messageHistoryTime}']`)
        messageArrivedTime.scrollIntoView() // scroll to the msg
      }
    })

  } else {
    messageHistoryDisplayBox.innerHTML = `
      <div class="ts-content is-center-aligned">
      <br><br><br><br>
        <div class="ts-content ts-text is-center-aligned is-large">
          No results found.
        </div>
      </div>
    `
  }


}