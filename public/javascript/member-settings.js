const memberSettingsModal = document.querySelector("#member-settings-modal")
const memberSettingsBtn = document.querySelector("#member-settings-btn")
const memberSettingsModalCloseBtn = document.querySelector("#member-settings-modal-close-btn")
const memberSettingsAvatar = document.querySelector("#settings-my-avatar")
const saveBtn = document.querySelector("#save-btn")
const signOutBtn = document.querySelector("#sign-out-btn")

// test
// memberSettingsModal.classList.add("is-visible")
//

memberSettingsBtn.addEventListener("click", () => {
  memberSettingsModal.classList.add("is-visible")
})

memberSettingsModalCloseBtn.addEventListener("click", () => {
  memberSettingsModal.classList.remove("is-visible")
})

document.addEventListener("click", (event) => {
  if (event.target.id === "member-settings-modal") {
    memberSettingsModal.classList.remove("is-visible")
  }
})

// --------------- logout -----------------

signOutBtn.addEventListener("click", () => {

  fetchSignOutAPI()
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
})

// ----------- profile -----------------

const settingsInputFile = document.querySelector("#settings-input-file")
const settingsMyName = document.querySelector("#settings-my-name")
const settingsMyEmail = document.querySelector("#settings-my-email")

// current profile
memberSettingsAvatar.src = currentUserAvatar
settingsMyName.value = currentUsername
settingsMyEmail.value = currentUserEmail

// ---------- avatar changing ----------

// avatar preload
settingsInputFile.addEventListener("change", (event) => {

  memberSettingsAvatar.src = URL.createObjectURL(event.target.files[0])
  memberSettingsAvatar.onload = function () {
    URL.revokeObjectURL(memberSettingsAvatar.src)
  }

})

// save
saveBtn.addEventListener("click", () => {

  let editedAvatarUrl
  let editedName
  let editedPassword
  let editedProfileStatus

  // profile (unfinished: password and profile status)
  editedAvatarUrl = settingsInputFile.files[0]
  editedName = settingsMyName.value
  // editedPassword = "0224"
  // editedProfileStatus = "lala"

  const editedProfile = {
    email: currentUserEmail,
  }

  // if a change exists, add it to the editedProfile object 
  if (editedName) { editedProfile.name = editedName }
  if (editedPassword) { editedProfile.password = editedPassword }
  if (editedProfileStatus) { editedProfile.profileStatus = editedProfileStatus }

  if (editedAvatarUrl) {
    getUploadedImageUrl(editedAvatarUrl)

    async function getUploadedImageUrl(editedAvatarUrl) {
      let formData = new FormData()
      formData.append("image", editedAvatarUrl)

      const response = await fetch("/api/file", {
        method: "POST",
        body: formData
      })

      const jsonData = await response.json()
      const uploadedImageUrl = jsonData.data // cloudfront-imageUrl

      editedProfile.avatarUrl = uploadedImageUrl
      console.log("image updated：", editedProfile)
      editProfile(editedProfile)
    }
  } else {
    console.log("no image updated：", editedProfile)
    editProfile(editedProfile)
  }

  memberSettingsModal.classList.remove("is-visible")

})


function editProfile(profile) {
  return fetch("/api/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile)
  })
}

