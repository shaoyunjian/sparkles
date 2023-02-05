const users = []


function userJoin(id, userId, username, roomId) {
  const user = { id, userId, username, roomId }

  users.push(user)

  return user
}


function getCurrentUser(id) {
  return users.find(user => user.id === id)
}

module.exports = {
  userJoin,
  getCurrentUser
}