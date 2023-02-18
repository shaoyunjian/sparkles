const users = []

function userConnect(id, userId, username) {
  const user = { id, userId, username }

  users.push(user)

  return user
}


function getCurrentUser(id) {
  return users.find(user => user.id === id)
}


function getUserSocketIdByUserId(userId) {
  const user = users.filter(user => user.userId === userId)

  let userSocketId = []
  user.forEach((value) => {
    userSocketId.push(value.id)
  })

  return userSocketId
}

function userDisconnect(id) {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)
  }
}

module.exports = {
  userConnect,
  getCurrentUser,
  getUserSocketIdByUserId,
  userDisconnect
}