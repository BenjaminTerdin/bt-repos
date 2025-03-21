// popup.js

let isKeyVisible = false;

// Toggle API key visibility
document.getElementById("toggleVisibility").addEventListener("click", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const toggleButton = document.getElementById("toggleVisibility");
  
  isKeyVisible = !isKeyVisible;
  apiKeyInput.type = isKeyVisible ? "text" : "password";
  toggleButton.textContent = isKeyVisible ? "👁️‍🗨️" : "👁️";
});

// Show confirmation overlay
function showConfirmation() {
  const overlay = document.getElementById("confirmationOverlay");
  overlay.style.display = "flex";
  
  // Hide overlay after 2 seconds
  setTimeout(() => {
    overlay.style.display = "none";
  }, 2000);
}

// Save AIMLAPI key when button is clicked
document.getElementById("saveKey").addEventListener("click", () => {
  const apiKey = document.getElementById("apiKey").value;
  
  if (!apiKey.trim()) {
    alert("Please enter an API key");
    return;
  }

  // Save AIMLAPI key to local storage
  browser.storage.local.set({ aimlApiKey: apiKey })
    .then(() => {
      showConfirmation();
      // Mask the key after saving
      document.getElementById("apiKey").value = "••••••••••••••••";
      document.getElementById("apiKey").type = "password";
      isKeyVisible = false;
      document.getElementById("toggleVisibility").textContent = "👁️";
    })
    .catch((err) => {
      console.error("Error saving AIMLAPI key:", err);
      alert("Error saving API key. Please try again.");
    });
});

// Retrieve AIMLAPI key when popup opens
browser.storage.local.get("aimlApiKey")
  .then((result) => {
    if (result.aimlApiKey) {
      // Show masked key
      document.getElementById("apiKey").value = "••••••••••••••••";
      document.getElementById("apiKey").type = "password";
    }
  })
  .catch((err) => console.error("Error retrieving AIMLAPI key:", err));
  