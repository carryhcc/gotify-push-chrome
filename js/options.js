/**
 * options.js - JavaScript logic for options page
 */

import { initI18n, applyTranslations } from './i18n.js';
import { validateConfig } from './utils/validation.js';
import { getConfiguration, saveConfiguration, sanitizeConfiguration } from './utils/storage.js';
import { showStatusMessage, populateSelect } from './utils/ui.js';

// Module scope variable to store current language translation strings
let i18nStrings = {};

/**
 * Updates visibility of context menu related controls
 * @param {boolean} enabled - Whether to enable context menu
 */
function updateContextMenuControlsVisibility(enabled) {
  const priorityElement = document.querySelector('.priority-item');
  const tokenElement = document.getElementById('contextMenuTokenContainer');

  if (priorityElement) {
    priorityElement.style.display = enabled ? 'block' : 'none';
  }

  if (tokenElement) {
    tokenElement.style.display = enabled ? 'block' : 'none';
  }
}

/**
 * Populates the context menu token selection dropdown
 * @param {Array} tokens - Token configuration list
 * @param {string} selectedToken - Currently selected token
 */
function populateContextMenuTokenSelect(tokens, selectedToken) {
  const tokenSelect = document.getElementById('contextMenuToken');
  if (!tokenSelect) return;

  if (tokens && tokens.length > 0) {
    const options = tokens.map((tokenInfo) => ({
      value: tokenInfo.token,
      text: tokenInfo.remark,
      selected: selectedToken === tokenInfo.token,
    }));
    populateSelect(tokenSelect, options);
  } else {
    tokenSelect.innerHTML = '';
  }
}

/**
 * Adds token information to the list
 * @param {Object} tokenInfo - Token information object containing remark and token fields
 */
function addTokenToList(tokenInfo = { remark: '', token: '' }) {
  const tokenList = document.getElementById('tokenList');
  const tokenItem = document.createElement('div');
  tokenItem.className = 'token-item';

  // Use internationalized text for placeholders and button text
  const remarkPlaceholder = i18nStrings.tokenRemarkPlaceholder || 'Environment';
  const tokenPlaceholder = i18nStrings.tokenTokenPlaceholder || 'Enter Token...';
  const deleteText = i18nStrings.deleteBtnText || 'Delete';

  tokenItem.innerHTML = `
    <input type="text" class="remark-input" placeholder="${remarkPlaceholder}" value="${
    tokenInfo.remark || ''
  }">
    <input type="text" class="token-input" placeholder="${tokenPlaceholder}" value="${
    tokenInfo.token || ''
  }">
    <button class="btn delete-btn">${deleteText}</button>
  `;

  tokenList.appendChild(tokenItem);
}

/**
 * Adds a new token input row
 */
function addToken() {
  addTokenToList();
}

/**
 * Deletes a token input row
 * @param {HTMLElement} button - Delete button element
 */
function deleteToken(button) {
  const tokenItem = button.parentElement;
  const tokenList = document.getElementById('tokenList');

  // Ensure at least one token input box is kept
  if (tokenList.children.length > 1) {
    tokenList.removeChild(tokenItem);
  } else {
    // If only one left, clear it instead of deleting
    tokenItem.querySelector('.remark-input').value = '';
    tokenItem.querySelector('.token-input').value = '';
  }
}

/**
 * Loads saved configuration
 */
async function loadOptions() {
  try {
    const config = await getConfiguration();

    // Set server URL
    const defaultUrl = i18nStrings.serverAddressPlaceholder || 'http://127.0.0.1:8080';
    document.getElementById('gotifyUrl').value = config.gotifyUrl || defaultUrl;

    // Load context menu toggle state
    const contextMenuEnabled = config.contextMenuEnabled || false;
    document.getElementById('contextMenuEnabled').checked = contextMenuEnabled;

    // Update context menu controls visibility
    updateContextMenuControlsVisibility(contextMenuEnabled);

    // Load context menu priority
    document.getElementById('contextMenuPriority').value = config.contextMenuPriority || 5;

    // Load token list
    const tokenList = document.getElementById('tokenList');
    tokenList.innerHTML = '';

    const gotifyTokens = config.gotifyTokens || [];

    if (gotifyTokens.length > 0) {
      gotifyTokens.forEach((tokenInfo) => {
        addTokenToList(tokenInfo);
      });

      // Populate context menu token selection dropdown
      populateContextMenuTokenSelect(gotifyTokens, config.contextMenuToken);
    } else {
      // If no saved tokens, add an empty input box
      addTokenToList({ remark: '', token: '' });
    }
  } catch (error) {
    // Failed to load configuration
    showStatusMessage('Failed to load configuration', 'error');
  }
}

/**
 * Saves configuration to Chrome storage
 */
async function saveOptions() {
  try {
    // Get form data
    const gotifyUrl = document.getElementById('gotifyUrl').value.trim();
    const tokenItems = document.querySelectorAll('#tokenList .token-item');
    const contextMenuEnabled = document.getElementById('contextMenuEnabled').checked;
    const contextMenuPriority = parseInt(document.getElementById('contextMenuPriority').value, 10);

    // Process token list
    const defaultRemarkPrefix = i18nStrings.defaultRemarkPrefix || 'Token';

    const gotifyTokens = Array.from(tokenItems)
      .map((item) => {
        const remark = item.querySelector('.remark-input').value.trim();
        const token = item.querySelector('.token-input').value.trim();
        // If remark is empty but token is valid, use first few characters of token as default remark
        const finalRemark =
          remark || (token ? `${defaultRemarkPrefix} (${token.substring(0, 6)}...)` : '');

        return {
          remark: finalRemark,
          token: token,
        };
      })
      .filter((item) => item.token !== ''); // Filter out items with empty tokens

    // Prepare configuration
    const config = {
      gotifyUrl: gotifyUrl,
      gotifyTokens: gotifyTokens,
      contextMenuEnabled: contextMenuEnabled,
      contextMenuPriority: contextMenuPriority,
      contextMenuToken: document.getElementById('contextMenuToken')?.value,
    };

    // Sanitize and validate configuration
    const sanitizedConfig = sanitizeConfiguration(config);
    const validation = validateConfig(sanitizedConfig);

    if (!validation.isValid) {
      // Show field-level validation errors instead of alert
      showFieldValidationErrors(validation.errors);
      return;
    }

    // Save configuration
    await saveConfiguration(sanitizedConfig);

    // Show save success message
    showStatusMessage(
      i18nStrings.saveSuccessMsg || chrome.i18n.getMessage('saveSuccessMsg') || 'Settings saved',
      'success'
    );

    // Notify background.js to update context menu
    chrome.runtime.sendMessage({
      type: 'UPDATE_CONTEXT_MENU',
      enabled: contextMenuEnabled,
      priority: contextMenuPriority,
      token: sanitizedConfig.contextMenuToken,
    });

    // Refresh context menu token selection dropdown after saving
    const tokenSelect = document.getElementById('contextMenuToken');
    let selectedToken = tokenSelect?.value;

    // Check if currently selected token is still valid
    const tokenStillExists = gotifyTokens.some((token) => token.token === selectedToken);
    if (!tokenStillExists && gotifyTokens.length > 0) {
      // If previously selected token no longer exists, use first token
      selectedToken = gotifyTokens[0].token;
    }

    // Repopulate dropdown
    populateContextMenuTokenSelect(gotifyTokens, selectedToken);
  } catch (error) {
    // Failed to save configuration
    showStatusMessage('Failed to save configuration', 'error');
  }
}

/**
 * Shows field-level validation errors
 * @param {Array} errors - Array of error messages
 */
function showFieldValidationErrors(errors) {
  // Clear previous validation errors
  clearFieldValidationErrors();

  errors.forEach((error) => {
    // Parse error message to identify field
    if (error.includes('Token') && error.includes(':')) {
      // Token validation error - format: "Token X: Error message"
      const tokenMatch = error.match(/Token (\d+):/);
      if (tokenMatch) {
        const tokenIndex = parseInt(tokenMatch[1], 10) - 1; // Convert to 0-based index
        const tokenItems = document.querySelectorAll('#tokenList .token-item');
        if (tokenItems[tokenIndex]) {
          const errorMessage = error.replace(/Token \d+:\s*/, ''); // Remove "Token X: " prefix
          showFieldError(tokenItems[tokenIndex].querySelector('.token-input'), errorMessage);
        }
      }
    } else if (error.includes('server URL')) {
      // Server URL validation error
      const urlField = document.getElementById('gotifyUrl');
      if (urlField) {
        showFieldError(urlField, error);
      }
    } else if (error.includes('token is required')) {
      // General token requirement error
      showStatusMessage(error, 'error');
    }
  });
}

/**
 * Clears all field validation errors
 */
function clearFieldValidationErrors() {
  // Remove error classes and error messages
  document.querySelectorAll('.error').forEach((field) => {
    field.classList.remove('error');
  });
  document.querySelectorAll('.error-message').forEach((errorMsg) => {
    errorMsg.remove();
  });
}

/**
 * Shows error message for a specific field
 * @param {HTMLElement} field - The input field
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
  if (!field) return;

  // Add error class to field
  field.classList.add('error');

  // Remove existing error message for this field
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.color = 'var(--color-danger)';
  errorElement.style.fontSize = 'var(--font-size-sm)';
  errorElement.style.marginTop = 'var(--space-xs)';

  // Insert error message after the field
  field.parentNode.appendChild(errorElement);
}

/**
 * Page initialization function
 */
async function initPage() {
  // Initialize internationalization and get current language and translations
  const { lang, strings } = await initI18n();
  i18nStrings = strings;

  // Set current value of language switcher and bind events
  const langSwitcher = document.getElementById('langSwitcher');
  if (langSwitcher) {
    langSwitcher.value = lang;

    langSwitcher.addEventListener('change', (e) => {
      const newLang = e.target.value;
      chrome.storage.sync.set({ userLang: newLang }, () => {
        // After language is saved, reapply translations
        i18nStrings = applyTranslations(newLang);
        // Reload options to update placeholders for dynamically added elements
        loadOptions();
      });
    });
  }

  // Load configuration
  loadOptions();

  // Bind events
  document.querySelector('.add-btn').addEventListener('click', addToken);
  document.querySelector('.save-btn').addEventListener('click', saveOptions);

  // Add real-time validation - clear errors when user types
  document.addEventListener('input', (event) => {
    if (
      event.target.classList.contains('token-input') ||
      event.target.classList.contains('remark-input') ||
      event.target.id === 'gotifyUrl'
    ) {
      // Clear error state when user starts typing
      event.target.classList.remove('error');
      const errorMessage = event.target.parentNode.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.remove();
      }
    }
  });

  // Bind context menu toggle event
  const contextMenuToggle = document.getElementById('contextMenuEnabled');
  if (contextMenuToggle) {
    contextMenuToggle.addEventListener('change', function () {
      updateContextMenuControlsVisibility(this.checked);
    });
  }
}

// Initialize after page loads
document.addEventListener('DOMContentLoaded', initPage);

// Handle dynamically added delete buttons through event delegation
document.getElementById('tokenList').addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-btn')) {
    deleteToken(event.target);
  }
});
