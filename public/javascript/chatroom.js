const logoutBtn = document.querySelector(".logout-btn")

logoutBtn.addEventListener("click", () => {

  fetchLogoutAPI()
  async function fetchLogoutAPI() {
    const response = await fetch("/api/user/auth", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })
    const jsonData = await response.json()
    if (jsonData.ok) {
      window.location = "/login"
    }
  }
})