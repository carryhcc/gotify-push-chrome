/**
 * popup.js - Popup page script for Gotify notification extension
 */

import { initI18n } from './i18n.js';
import { validatePushForm } from './utils/validation.js';
// Error handling utilities are used in the shared API
import { sendPushMessage } from './utils/gotifyApi.js';
import { getStorageValue, setStorageValue } from './utils/storage.js';
import { showStatusMessage, populateSelect } from './utils/ui.js';

// Module scope variable to store current language translations
let i18nStrings = {};

/**
 * Loads configuration and updates UI
 * Gets Gotify server configuration and token information from storage and updates UI display accordingly
 */
async function loadConfig() {
  try {
    const [gotifyTokens, lastSelectedToken] = await Promise.all([
      getStorageValue('gotifyTokens', []),
      getStorageValue('lastSelectedToken', ''),
    ]);

    // Display different UI based on whether configuration exists
    if (gotifyTokens.length === 0) {
      document.getElementById('configForm').classList.add('hidden');
      document.getElementById('noConfig').classList.remove('hidden');
    } else {
      document.getElementById('configForm').classList.remove('hidden');
      document.getElementById('noConfig').classList.add('hidden');

      // Populate token selection list
      const tokenSelect = document.getElementById('tokenSelect');
      const options = gotifyTokens.map((tokenInfo) => ({
        value: tokenInfo.token,
        text: tokenInfo.remark,
        selected: tokenInfo.token === lastSelectedToken,
      }));

      populateSelect(tokenSelect, options);
    }
  } catch (error) {
    // Failed to load configuration
    showStatusMessage('Failed to load configuration', 'error');
  }
}

/**
 * Sends message to Gotify server
 * Gets form data, validates input, then sends POST request to Gotify server
 */
async function sendMessage() {
  // Clear previous status message
  showStatusMessage('', 'info', 0);

  // Get input values
  const tokenSelect = document.getElementById('tokenSelect');
  const selectedToken = tokenSelect.value;
  let title = document.getElementById('titleInput').value.trim();
  const message = document.getElementById('messageInput').value.trim();
  const priority = parseInt(document.getElementById('priorityInput').value, 10);

  // Validate form data
  const validation = validatePushForm({
    title: title,
    message: message,
    priority: priority,
    token: selectedToken,
  });

  if (!validation.isValid) {
    showStatusMessage(validation.errors.join('. '), 'error');
    return;
  }

  // If title is empty, set default value
  if (!title) {
    title = i18nStrings.defaultTitle || 'default';
  }

  // Show sending status
  showStatusMessage(i18nStrings.statusSending, 'success');

  try {
    // Get server URL
    const gotifyUrl = await getStorageValue(
      'gotifyUrl',
      i18nStrings.serverAddressPlaceholder || 'http://127.0.0.1:8080'
    );

    // Send push message using shared API
    await sendPushMessage({
      url: gotifyUrl,
      token: selectedToken,
      title: title,
      message: message,
      priority: priority,
    });

    // Success
    showStatusMessage(i18nStrings.statusSuccess, 'success');

    // Save currently selected token
    await setStorageValue('lastSelectedToken', selectedToken);

    // Clear message content, keep title and priority
    document.getElementById('messageInput').value = '';
  } catch (error) {
    // Gotify request failed - handle different types of errors
    let errorMsg = i18nStrings.statusErrorGeneric;

    if (error.userMessage) {
      // Use user-friendly message from error handler
      errorMsg = error.userMessage;
    } else if (error.message) {
      // Fallback to legacy error handling
      if (error.message.includes('Failed to fetch')) {
        errorMsg = i18nStrings.statusErrorFetch;
      } else if (error.message.includes('403')) {
        errorMsg = i18nStrings.statusError403;
      } else if (error.message.includes('404')) {
        errorMsg = i18nStrings.statusError404;
      } else {
        errorMsg = `${i18nStrings.statusErrorPrefix} ${error.message}`;
      }
    }

    showStatusMessage(errorMsg, 'error');
  }
}

/**
 * Opens options page
 * Uses Chrome API to open the extension's options page
 */
function openOptions() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
}

/**
 * Page initialization function
 * Initializes internationalization, loads configuration and binds event listeners
 */
async function initPage() {
  // Initialize i18n and get translations
  const { strings } = await initI18n();
  i18nStrings = strings;

  // Load configuration
  loadConfig();

  // Bind events
  document.querySelector('.send-btn').addEventListener('click', sendMessage);
  document.querySelector('.options-btn').addEventListener('click', openOptions);
  document.getElementById('configLink').addEventListener('click', (e) => {
    e.preventDefault();
    openOptions();
  });
}

// Initialize after page loads
document.addEventListener('DOMContentLoaded', initPage);
