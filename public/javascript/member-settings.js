const memberSettingsModal = document.querySelector("#member-settings-modal")
const memberSettingsBtn = document.querySelector("#member-settings-btn")
const memberSettingsModalCloseBtn = document.querySelector("#member-settings-modal-close-btn")
const settingsInputFile = document.querySelector("#settings-input-file")
const saveBtn = document.querySelector("#save-btn")
const signOutBtn = document.querySelector("#sign-out-btn")

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
})

// ----------- profile edit -----------------

// avatar preload
settingsInputFile.addEventListener("change", (event) => {

  settingsMyAvatar.src = URL.createObjectURL(event.target.files[0])
  settingsMyAvatar.onload = function () {
    URL.revokeObjectURL(settingsMyAvatar.src)
  }

})

// save 
saveBtn.addEventListener("click", () => {

  let editedAvatarUrl
  let editedName
  let editedPassword
  let editedProfileStatus

  // profile 
  editedAvatarUrl = settingsInputFile.files[0]
  editedName = settingsMyName.value

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
      editProfile(editedProfile)

      settingsInputFile.value = ""
      homeMyName.textContent = editedName
      settingsMyName.value = editedName
      settingsMyAvatar.src = uploadedImageUrl
      homeMyAvatar.src = uploadedImageUrl
    }
  } else {
    editProfile(editedProfile)

    homeMyName.textContent = editedName
    settingsMyName.value = editedName
    greetingMyName.textContent = editedName
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

