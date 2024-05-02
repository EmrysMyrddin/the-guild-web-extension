const secretKeyInput = document.getElementById("secret_key");
const saveButton = document.getElementById("save");

document.addEventListener("DOMContentLoaded", async () => {
  const { secretKey } = await chrome.storage.local.get("secretKey");
  secretKeyInput.value = secretKey;
});

saveButton.addEventListener("click", async () => {
  const secretKey = document.getElementById("secret_key").value;
  await chrome.storage.local.set({ secretKey });
  saveButton.disabled = true;
  saveButton.textContent = "Saved!";
});
