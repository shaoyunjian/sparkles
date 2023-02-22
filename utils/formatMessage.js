const moment = require("moment")

function formatMessage(id, name, avatar, msg, imageUrl, roomId) {
  return {
    userId: id,
    username: name,
    avatarUrl: avatar,
    message: msg,
    messageImageUrl: imageUrl,
    roomId: roomId,
    date: moment().format("YYYY-MM-DD"),
    time: moment().format("hh:mm a")
  }
}

module.exports = formatMessage