function userDataValidation(name = null, email, password) {
  const name_regex = /^.{1,10}$/
  const email_regex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/
  const password_regex = /^[a-zA-Z0-9]{8,16}$/

  if (name) {
    if (!name_regex.test(name)) {
      return "invalid name"
    } else if (!email_regex.test(email)) {
      return "invalid email"
    } else if (!password_regex.test(password)) {
      return "invalid password"
    } else {
      return "valid"
    }
  } else {
    if (!email_regex.test(email)) {
      return "invalid email"
    } else if (!password_regex.test(password)) {
      return "invalid password"
    } else {
      return "valid"
    }
  }
}

module.exports = { userDataValidation }