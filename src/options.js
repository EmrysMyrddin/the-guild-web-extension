const secretKeyInput = document.getElementById('secret_key')
const saveButton = document.getElementById('save')

if (!(secretKeyInput instanceof HTMLInputElement)) {
  throw new Error('#secret_key element is not an input')
} else if (!(saveButton instanceof HTMLButtonElement)) {
  throw new Error('#save element is not a button')
}

document.addEventListener('DOMContentLoaded', async () => {
  const { secretKey } = await chrome.storage.local.get('secretKey')
  secretKeyInput.value = secretKey
})

saveButton.addEventListener('click', async () => {
  const secretKey = secretKeyInput.value
  await chrome.storage.local.set({ secretKey })
  saveButton.disabled = true
  saveButton.textContent = 'Saved!'
})
