// content.js

// Create a loading indicator
function createLoadingIndicator() {
  try {
    const indicator = document.createElement('div');
    indicator.id = 'ai-text-fill-indicator';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      display: none;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(indicator);
    return indicator;
  } catch (error) {
    console.error('Error creating loading indicator:', error);
    return null;
  }
}

// Show loading indicator
function showLoading(message) {
  try {
    const indicator = document.getElementById('ai-text-fill-indicator') || createLoadingIndicator();
    if (indicator) {
      indicator.textContent = message;
      indicator.style.display = 'block';
    }
  } catch (error) {
    console.error('Error showing loading indicator:', error);
  }
}

// Hide loading indicator
function hideLoading() {
  try {
    const indicator = document.getElementById('ai-text-fill-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  } catch (error) {
    console.error('Error hiding loading indicator:', error);
  }
}

// Fetch AI completion from AIMLAPI
async function fetchCompletion(prompt) {
  try {
    const { aimlApiKey } = await browser.storage.local.get("aimlApiKey");

    if (!aimlApiKey) {
      console.error("No AIMLAPI key found. Please set it in the extension popup.");
      return "";
    }

    showLoading("AI is thinking...");
    
    // Add proper headers and credentials
    const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${aimlApiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Connection": "keep-alive"
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        "model": "o1-mini",
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful AI assistant that completes text in a natural way."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        "max_tokens": 100,
        "temperature": 0.7,
        "top_p": 1,
        "frequency_penalty": 0.5,
        "presence_penalty": 0.5,
        "stream": false
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    hideLoading();
    return data.choices[0].message.content || "";
  } catch (error) {
    console.error("Error fetching completion:", error);
    hideLoading();
    showLoading("Error: Failed to get AI response");
    setTimeout(hideLoading, 3000);
    return "";
  }
}

// Get the active editor element
function getActiveEditor() {
  // Try multiple possible selectors for Google Docs
  const selectors = [
    '.kix-paragraphrenderer',
    '.docs-editor-container',
    '.kix-lineview-content',
    '.kix-canvas-tile-content'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`Found editor with selector: ${selector}`);
      return element;
    }
  }
  
  console.error("Could not find any Google Docs editor element");
  return null;
}

// Get current text content
function getCurrentText() {
  try {
    const selection = window.getSelection();
    if (!selection.rangeCount) return "";

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    
    if (textNode.nodeType === Node.TEXT_NODE) {
      return textNode.textContent;
    }
    
    // Try to get text from parent elements
    const parentElements = [
      textNode.closest('.kix-paragraphrenderer'),
      textNode.closest('.docs-editor-container'),
      textNode.closest('.kix-lineview-content')
    ];
    
    for (const element of parentElements) {
      if (element && element.innerText) {
        return element.innerText;
      }
    }
    
    return "";
  } catch (error) {
    console.error("Error getting current text:", error);
    return "";
  }
}

// Handle Google Docs specific functionality
function handleGoogleDocs() {
  console.log("Initializing Google Docs handler");

  let isProcessing = false;
  let editor = null;

  // Function to ensure we have an editor
  function ensureEditor() {
    if (!editor) {
      editor = getActiveEditor();
    }
    return editor;
  }

  // Debug function to log key details
  function logKeyDetails(event) {
    console.log('Key Event Details:', {
      type: event.type,
      code: event.code,
      key: event.key,
      keyCode: event.keyCode,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      location: event.location,
      timestamp: new Date().toISOString()
    });
  }

  // Listen for text input in Google Docs
  document.addEventListener('input', async (event) => {
    console.log('Input event triggered');
    if (isProcessing || !ensureEditor()) return;
    
    const currentText = getCurrentText();
    console.log("Current text:", currentText);

    if (currentText.length > 10) {
      isProcessing = true;
      const suggestion = await fetchCompletion(currentText);
      isProcessing = false;

      if (suggestion && editor) {
        editor.setAttribute('data-ai-suggestion', suggestion);
        console.log("AI suggestion set:", suggestion);
      }
    }
  });

  // Add multiple key event listeners for better detection
  ['keydown', 'keyup', 'keypress'].forEach(eventType => {
    document.addEventListener(eventType, async (event) => {
      logKeyDetails(event);

      // Check for AltRight key specifically
      if (
        (event.type === 'keydown') && 
        (
          event.code === "AltRight" || 
          (event.key === "Alt" && event.location === 2) ||
          event.keyCode === 18
        )
      ) {
        console.log('Right Alt key detected!');
        event.preventDefault();
        event.stopPropagation();

        if (!ensureEditor()) {
          console.error('No editor found');
          return;
        }

        const suggestion = editor.getAttribute('data-ai-suggestion');
        console.log('Current suggestion:', suggestion);

        if (!suggestion) {
          console.log("No suggestion available");
          return;
        }

        showLoading("Applying AI suggestion...");
        
        try {
          const selection = window.getSelection();
          if (!selection.rangeCount) {
            console.log('No selection range found');
            return;
          }

          const range = selection.getRangeAt(0);
          const textNode = range.startContainer;
          console.log('Text node type:', textNode.nodeType);

          if (textNode.nodeType === Node.TEXT_NODE) {
            const originalText = textNode.textContent;
            textNode.textContent = originalText + suggestion;
            editor.removeAttribute('data-ai-suggestion');
            console.log("Suggestion applied successfully", {
              original: originalText,
              suggestion: suggestion,
              combined: textNode.textContent
            });
          } else {
            console.log("Not a text node, couldn't apply suggestion");
          }
        } catch (error) {
          console.error("Error applying suggestion:", error);
        } finally {
          hideLoading();
        }
      }
    }, true); // Use capture phase for better key detection
  });

  // Additional initialization debug log
  console.log('Google Docs handler fully initialized', {
    editor: editor,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });
}

// Initialize the extension with retry mechanism
function initialize() {
  console.log("AI Text Fill extension initializing...");
  
  function tryInitialize(retryCount = 0) {
    if (retryCount > 5) {
      console.error("Failed to initialize after 5 retries");
      return;
    }

    if (document.readyState === 'complete') {
      console.log(`Attempting initialization (attempt ${retryCount + 1})`);
      setTimeout(() => {
        handleGoogleDocs();
        // Verify initialization
        if (!document.querySelector('.kix-paragraphrenderer')) {
          console.log("Editor not found, retrying...");
          tryInitialize(retryCount + 1);
        } else {
          console.log("Extension successfully initialized!");
        }
      }, 1000);
    } else {
      window.addEventListener('load', () => tryInitialize(retryCount));
    }
  }

  tryInitialize();
}

// Start the extension
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Starting initialization');
  initialize();
});

  