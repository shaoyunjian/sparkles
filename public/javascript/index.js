// ----- handle login & signup btn ------

const navLoginBtn = document.querySelector("#nav-login-btn")
const navSignUpBtn = document.querySelector("#nav-signup-btn")
const loginModal = document.querySelector("#login-modal")
const signupModal = document.querySelector("#signup-modal")
const loginModalCloseBtn = document.querySelector("#login-modal-close-btn")
const signupModalCloseBtn = document.querySelector("#signup-modal-close-btn")
const loginToSignupBtn = document.querySelector("#login-to-signup-btn")
const signupToLoginBtn = document.querySelector("#signup-to-login-btn")
const notLoggedInStatus = document.querySelector("#not-loggedin-status")
const loggedInStatus = document.querySelector("#loggedin-status")
const accessChatroomBtn = document.querySelector("#nav-chatroom-btn")
const signOutBtn = document.querySelector("#nav-signout-btn")

navLoginBtn.onclick = () => {
  loginModal.classList.add("is-visible")
}

navSignUpBtn.onclick = () => {
  signupModal.classList.add("is-visible")
}

loginModalCloseBtn.onclick = () => {
  loginModal.classList.remove("is-visible")
}

signupModalCloseBtn.onclick = () => {
  signupModal.classList.remove("is-visible")
}

document.onclick = (event) => {
  if (event.target.id === "login-modal") {
    loginModal.classList.remove("is-visible")
  }

  if (event.target.id === "signup-modal") {
    signupModal.classList.remove("is-visible")
  }
}

loginToSignupBtn.onclick = () => {
  loginModal.classList.remove("is-visible")
  signupModal.classList.add("is-visible")
}

signupToLoginBtn.onclick = () => {
  signupModal.classList.remove("is-visible")
  loginModal.classList.add("is-visible")
}

accessChatroomBtn.onclick = () => {
  window.location = "/chatroom"
}

signOutBtn.onclick = () => {
  fetchSignOutAPI()
}

// --------- login -----------

const loginEmail = document.querySelector("#login-email")
const loginPassword = document.querySelector("#login-password")
const loginBtn = document.querySelector("#login-btn")
const loginMessage = document.querySelector(".login-message")
const loginEmailErrorMessage = document.querySelector("#login-email-error-message")
const loginPasswordErrorMessage = document.querySelector("#login-password-error-message")


loginBtn.onclick = () => {
  const loginEmailValue = loginEmail.value.trim()
  const loginPasswordValue = loginPassword.value.trim()

  if (!loginEmailValue || !loginPasswordValue) {
    loginMessage.textContent = "Please enter your login information."
  } else {
    fetchLoginAPI()
  }

  async function fetchLoginAPI() {
    const response = await fetch("/api/user/auth", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmailValue,
        password: loginPasswordValue
      })
    })

    const jsonData = await response.json()

    if (jsonData.ok) {
      notLoggedInStatus.style.display = "none"
      loggedInStatus.style.display = "flex"
      window.location = "/chatroom"
    } else if (jsonData.error) {
      if (jsonData.message === "Email or password is wrong") {
        loginMessage.textContent = "Email or password is incorrect"
      }
    }
  }

}

// --------- check current login status ---------

checkLoginStatus()
async function checkLoginStatus() {
  const response = await fetch("/api/user/auth")
  const jsonData = await response.json()

  if (jsonData.data) {
    notLoggedInStatus.style.display = "none"
    loggedInStatus.style.display = "flex"
  } else {
    notLoggedInStatus.style.display = "flex"
    loggedInStatus.style.display = "none"
  }
}

// --------- sign up -----------

const signupUsername = document.querySelector("#signup-username")
const signupEmail = document.querySelector("#signup-email")
const signupPassword = document.querySelector("#signup-password")
const signupBtn = document.querySelector("#signup-btn")
const signupMessage = document.querySelector(".signup-message")
const signupSuccessMessage = document.querySelector(".signup-success-message")
const signupUsernameErrorMessage = document.querySelector("#signup-username-error-message")
const signupEmailErrorMessage = document.querySelector("#signup-email-error-message")
const signupPasswordErrorMessage = document.querySelector("#signup-password-error-message")

signupBtn.onclick = () => {
  const signupUsernameValue = signupUsername.value.trim()
  const signupEmailValue = signupEmail.value.trim()
  const signupPasswordValue = signupPassword.value.trim()

  const signupUsernameResult = userDataValidation("name", signupUsernameValue)
  const signupEmailResult = userDataValidation("email", signupEmailValue)
  const signupPasswordResult = userDataValidation("password", signupPasswordValue)

  if (signupUsernameResult === "empty name" ||
    signupUsernameResult === "invalid name") {
    signupUsername.parentElement.classList.add("is-negative")
    signupUsernameErrorMessage.textContent = "Username must be 1-10 characters."
  } else {
    signupUsername.parentElement.classList.remove("is-negative")
    signupUsernameErrorMessage.textContent = ""
  }

  if (signupEmailResult === "empty email") {
    signupEmail.parentElement.classList.add("is-negative")
    signupEmailErrorMessage.textContent = "Please enter your email address."
  } else if (signupEmailResult === "invalid email") {
    signupEmail.parentElement.classList.add("is-negative")
    signupEmailErrorMessage.textContent = "Email is invalid or already taken."
  } else {
    signupEmail.parentElement.classList.remove("is-negative")
    signupEmailErrorMessage.textContent = ""
  }

  if (signupPasswordResult === "empty password" ||
    signupPasswordResult === "invalid password") {
    signupPassword.parentElement.classList.add("is-negative")
    signupPasswordErrorMessage.textContent = "Password must be 8-16 characters."
  } else {
    signupPassword.parentElement.classList.remove("is-negative")
    signupPasswordErrorMessage.textContent = ""
  }

  if (signupUsernameResult === "valid name" &&
    signupEmailResult === "valid email" &&
    signupPasswordResult === "valid password") {
    // signupSuccessMessage.textContent = "Created successfully"
    fetchSignUpAPI()
  }

  async function fetchSignUpAPI() {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: signupUsernameValue,
        email: signupEmailValue,
        password: signupPasswordValue
      })
    })
    const jsonData = await response.json()
    console.log(jsonData)

    if (jsonData.ok) {
      signupMessage.textContent = ""
      signupSuccessMessage.textContent = "Signup successful!"
      signupUsername.value = ""
      signupEmail.value = ""
      signupPassword.value = ""
    } else {
      if (jsonData.message === "Empty input") {
        signupMessage.textContent = "Empty input"
      } else if (jsonData.message === "Email already exists") {
        signupMessage.textContent = "Email already exists"
      }
    }
  }

}


function userDataValidation(type, userData) {
  const name_regex = /^.{1,10}$/
  const email_regex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/
  const password_regex = /^[a-zA-Z0-9]{8,16}$/

  if (type === "name") {
    if (!userData) {
      return "empty name"
    } else if (!name_regex.test(userData)) {
      return "invalid name"
    } else {
      return "valid name"
    }
  } else if (type === "email") {
    if (!userData) {
      return "empty email"
    } else if (!email_regex.test(userData)) {
      return "invalid email"
    } else {
      return "valid email"
    }
  } else if (type === "password") {
    if (!userData) {
      return "empty password"
    } else if (!password_regex.test(userData)) {
      return "invalid password"
    } else {
      return "valid password"
    }
  }
}


//  ------ handle header curve -------

handleHeaderCurve()
function handleHeaderCurve() {
  const curve = document.querySelector("#curve")
  let scrollPosition = 0
  let defaultCurveValue = 350
  let curveRate = 3
  let ticking = false
  let curveValue

  // scroll Listener
  window.addEventListener("scroll", () => {
    scrollPosition = window.scrollY

    if (!ticking) {
      window.requestAnimationFrame(() => {
        scrollToChangeCurve(scrollPosition)
        ticking = false
      })
    }

    ticking = true
  })

  function scrollToChangeCurve(scrollPosition) {
    if (scrollPosition >= 0 && scrollPosition < defaultCurveValue) {
      curveValue = defaultCurveValue - parseFloat(scrollPosition / curveRate)
      curve.setAttribute(
        "d",
        "M 800 300 Q 400 " + curveValue + " 0 300 L 0 0 L 800 0 L 800 300 Z"
      );
    }
  }
}