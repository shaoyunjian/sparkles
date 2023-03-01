function profileEditValidation(name, password) {
  const name_regex = /^.{1,10}$/
  const password_regex = /^[a-zA-Z0-9]{8,16}$/

  if (name) {
    if (!name_regex.test(name)) {
      return "invalid username"
    } else {
      return "valid username"
    }
  }

  if (password) {
    if (!password_regex.test(password)) {
      return "invalid password"
    } else {
      return "valid password"
    }
  }
}

module.exports = { profileEditValidation }