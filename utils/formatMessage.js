const moment = require("moment")

function formatMessage(id, name, msg) {
  return {
    userId: id,
    username: name,
    message: msg,
    time: moment().format("hh:mm a")
  }
}

module.exports = formatMessage