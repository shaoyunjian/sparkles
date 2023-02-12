const registerUsername = document.querySelector("#register-username")
const registerEmail = document.querySelector("#register-email")
const registerPassword = document.querySelector("#register-password")
const registerBtn = document.querySelector("#register-btn")
const registerMessage = document.querySelector(".register-message")

const loginEmail = document.querySelector("#login-email")
const loginPassword = document.querySelector("#login-password")
const loginBtn = document.querySelector("#login-btn")
const loginMessage = document.querySelector(".login-message")

// ------------------ register -------------------

registerBtn.addEventListener("click", () => {
  const registerUsernameValue = registerUsername.value.trim()
  const registerEmailValue = registerEmail.value.trim()
  const registerPasswordValue = registerPassword.value.trim()

  fetchRegisterAPI()
  async function fetchRegisterAPI() {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: registerUsernameValue,
        email: registerEmailValue,
        password: registerPasswordValue
      })
    })
    const jsonData = await response.json()

    if (jsonData.ok) {
      registerMessage.textContent = "Created successfully"
      registerUsername.value = ""
      registerEmail.value = ""
      registerPassword.value = ""
    } else {
      if (jsonData.message === "Empty input") {
        registerMessage.textContent = "Empty input"
      } else if (jsonData.message === "Email already exists") {
        registerMessage.textContent = "Email already exists"
      }
    }
  }

})

// ------------------ login -------------------

loginBtn.addEventListener("click", () => {
  const loginEmailValue = loginEmail.value.trim()
  const loginPasswordValue = loginPassword.value.trim()

  fetchLoginAPI()
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
    console.log(jsonData)
    if (jsonData.ok) {
      window.location = "/chatroom"
      console.log("登入成功")
    } else if (jsonData.error) {
      console.log(jsonData.message)
      if (jsonData.message === "Empty input") {
        loginMessage.textContent = "Empty input"
      } else if (jsonData.message === "Email or password is wrong") {
        loginMessage.textContent = "Email or password is wrong"
      }
    }
  }

})
