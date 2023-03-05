// sign out

async function fetchSignOutAPI() {
  const response = await fetch("/api/user/auth", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  })
  const jsonData = await response.json()
  if (jsonData.ok) {
    window.location = "/"
  }
}

