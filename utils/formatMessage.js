const moment = require("moment")

function formatMessage(id, name, avatar, msg, roomId) {
  return {
    userId: id,
    username: name,
    avatarUrl: avatar,
    message: msg,
    roomId: roomId,
    date: moment().format("YYYY-MM-DD"),
    time: moment().format("hh:mm a")
  }
}

module.exports = formatMessage