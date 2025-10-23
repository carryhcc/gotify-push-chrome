/**
 * background.js - Background Service Worker
 * Manages context menu and notification functionality
 */

// Error handling utilities are used in the shared API
import { sendPushMessage } from './utils/gotifyApi.js';
import { getStorageValue } from './utils/storage.js';

// Context menu ID constant
const CONTEXT_MENU_ID = 'SEND_TO_GOTIFY';

/**
 * Creates the context menu
 */
function createContextMenu() {
  // First try to update (if exists), then create if it doesn't exist
  chrome.contextMenus.update(
    CONTEXT_MENU_ID,
    {
      title: chrome.i18n.getMessage('contextMenuTitle'),
      contexts: ['selection'],
    },
    () => {
      // If update fails (usually means doesn't exist), try to create
      if (chrome.runtime.lastError) {
        // Most common error is item not found; create new menu in this case
        chrome.contextMenus.create(
          {
            id: CONTEXT_MENU_ID,
            title: chrome.i18n.getMessage('contextMenuTitle'),
            contexts: ['selection'],
          },
          () => {
            // Check for errors in create callback; safely ignore duplicate id (possible concurrent creation)
            if (chrome.runtime.lastError) {
              const msg = String(chrome.runtime.lastError.message || '').toLowerCase();
              if (!msg.includes('duplicate') && !msg.includes('already exists')) {
                // Context menu creation failed - log for debugging
                // console.error('Failed to create context menu:', chrome.runtime.lastError);
              }
            }
          }
        );
      }
    }
  );
}

/**
 * Removes the context menu
 */
function removeContextMenu() {
  chrome.contextMenus.remove(CONTEXT_MENU_ID, () => {
    // Ignore possible errors (e.g., menu doesn't exist)
    void chrome.runtime.lastError;
  });
}

/**
 * Initializes the context menu
 * Decides whether to create the context menu based on user settings
 */
function initializeContextMenu() {
  chrome.storage.sync.get('contextMenuEnabled', (result) => {
    if (result.contextMenuEnabled) {
      createContextMenu();
    } else {
      removeContextMenu();
    }
  });
}

/**
 * Sends push notification from background
 * @param {string} title - Notification title
 * @param {string} message - Notification content
 */
async function sendPushFromBackground(title, message) {
  try {
    // Get configuration
    const [gotifyUrl, gotifyTokens, contextMenuPriority, contextMenuToken] = await Promise.all([
      getStorageValue('gotifyUrl'),
      getStorageValue('gotifyTokens', []),
      getStorageValue('contextMenuPriority', 5),
      getStorageValue('contextMenuToken'),
    ]);

    // Validate configuration completeness
    if (!gotifyUrl || !gotifyTokens || gotifyTokens.length === 0) {
      // No configuration available
      const noConfigTitle =
        chrome.i18n.getMessage('notificationPushFailed') || 'Gotify Push Failed';
      const noConfigMsg =
        chrome.i18n.getMessage('notificationNoConfig') ||
        'Please configure server and Token in plugin settings first';
      showNotification(noConfigTitle, noConfigMsg);
      return;
    }

    // Validate and set priority
    let pushPriority = contextMenuPriority;
    if (typeof pushPriority !== 'number' || pushPriority < 0 || pushPriority > 10) {
      pushPriority = 5; // Default priority
    }

    // Select token to use
    let selectedToken = gotifyTokens[0].token;
    if (contextMenuToken) {
      const foundToken = gotifyTokens.find((tokenInfo) => tokenInfo.token === contextMenuToken);
      if (foundToken) {
        selectedToken = foundToken.token;
      }
    }

    // Send push message using shared API
    await sendPushMessage({
      url: gotifyUrl,
      token: selectedToken,
      title: title,
      message: message,
      priority: pushPriority,
    });

    // Success notification
    const successTitle =
      chrome.i18n.getMessage('notificationPushSuccess') || 'Gotify Push Successful';
    const successMessage =
      chrome.i18n.getMessage('notificationWithTitle', [title]) || `Title: ${title}`;
    showNotification(successTitle, successMessage);
  } catch (error) {
    // Gotify push failed
    const failTitle = chrome.i18n.getMessage('notificationPushFailed') || 'Gotify Push Failed';

    let errorMessage;
    if (error.userMessage) {
      errorMessage = error.userMessage;
    } else {
      errorMessage =
        chrome.i18n.getMessage('notificationError', [error.message]) ||
        `Error: ${error.message}. Please check network, URL, or Token.`;
    }

    showNotification(failTitle, errorMessage);
  }
}

/**
 * Shows browser notification
 * @param {string} title - Notification title
 * @param {string} message - Notification content
 */
function showNotification(title, message) {
  const iconUrl = chrome.runtime.getURL('icons/icon128.png');
  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconUrl,
    title: title,
    message: message,
  });
}

// Event listeners - Initialize on browser startup
// Initialize context menu in service worker lifecycle to ensure it works in MV3
self.addEventListener('install', (_event) => {
  // Activate service worker as soon as possible during installation
  self.skipWaiting();
});

self.addEventListener('activate', (_event) => {
  // Initialize context menu after activation
  initializeContextMenu();
});

// Also listen to runtime.onInstalled to handle extension update scenarios
chrome.runtime.onInstalled.addListener(initializeContextMenu);

// Event listener - Handle menu update messages from options page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_CONTEXT_MENU') {
    if (request.enabled) {
      createContextMenu();
    } else {
      removeContextMenu();
    }
    sendResponse({ status: 'Context menu updated' });
  }
  return true; // Keep message channel open
});

// Event listener - Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
    const selectedText = info.selectionText;
    const pageTitle = tab.title || '';
    sendPushFromBackground(pageTitle, selectedText);
  }
});
