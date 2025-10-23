/**
 * storage.js - Chrome storage utilities
 * Provides reusable functions for managing Chrome extension storage
 */

/**
 * Storage keys used by the extension
 */
export const STORAGE_KEYS = {
  GOTIFY_URL: 'gotifyUrl',
  GOTIFY_TOKENS: 'gotifyTokens',
  CONTEXT_MENU_ENABLED: 'contextMenuEnabled',
  CONTEXT_MENU_PRIORITY: 'contextMenuPriority',
  CONTEXT_MENU_TOKEN: 'contextMenuToken',
  LAST_SELECTED_TOKEN: 'lastSelectedToken',
  USER_LANG: 'userLang',
};

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  [STORAGE_KEYS.GOTIFY_URL]: 'http://127.0.0.1:8080',
  [STORAGE_KEYS.CONTEXT_MENU_ENABLED]: false,
  [STORAGE_KEYS.CONTEXT_MENU_PRIORITY]: 5,
  [STORAGE_KEYS.GOTIFY_TOKENS]: [],
  [STORAGE_KEYS.USER_LANG]: null,
};

/**
 * Gets a value from Chrome storage with default fallback
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {Promise<*>} Stored value or default
 */
export function getStorageValue(key, defaultValue = null) {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      const value = result[key];
      resolve(
        value !== undefined ? value : defaultValue !== null ? defaultValue : DEFAULT_CONFIG[key]
      );
    });
  });
}

/**
 * Sets a value in Chrome storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {Promise<void>}
 */
export function setStorageValue(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Gets multiple values from Chrome storage
 * @param {Array<string>} keys - Array of storage keys
 * @returns {Promise<Object>} Object with key-value pairs
 */
export function getStorageValues(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        // Apply defaults for missing keys
        const data = {};
        keys.forEach((key) => {
          data[key] = result[key] !== undefined ? result[key] : DEFAULT_CONFIG[key];
        });
        resolve(data);
      }
    });
  });
}

/**
 * Sets multiple values in Chrome storage
 * @param {Object} data - Object with key-value pairs to store
 * @returns {Promise<void>}
 */
export function setStorageValues(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Removes a value from Chrome storage
 * @param {string} key - Storage key to remove
 * @returns {Promise<void>}
 */
export function removeStorageValue(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove([key], () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Clears all storage data
 * @returns {Promise<void>}
 */
export function clearStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.clear(() => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Gets the complete configuration object
 * @returns {Promise<Object>} Complete configuration
 */
export async function getConfiguration() {
  const keys = Object.values(STORAGE_KEYS);
  return await getStorageValues(keys);
}

/**
 * Saves the complete configuration object
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
export async function saveConfiguration(config) {
  // Filter out undefined values
  const cleanConfig = {};
  Object.keys(config).forEach((key) => {
    if (config[key] !== undefined) {
      cleanConfig[key] = config[key];
    }
  });

  return await setStorageValues(cleanConfig);
}

/**
 * Validates and sanitizes configuration data
 * @param {Object} config - Configuration to validate
 * @returns {Object} Sanitized configuration
 */
export function sanitizeConfiguration(config) {
  const sanitized = {};

  if (config[STORAGE_KEYS.GOTIFY_URL]) {
    sanitized[STORAGE_KEYS.GOTIFY_URL] = config[STORAGE_KEYS.GOTIFY_URL].trim();
  }

  if (Array.isArray(config[STORAGE_KEYS.GOTIFY_TOKENS])) {
    sanitized[STORAGE_KEYS.GOTIFY_TOKENS] = config[STORAGE_KEYS.GOTIFY_TOKENS]
      .map((token) => ({
        remark: (token.remark || '').trim(),
        token: (token.token || '').trim(),
      }))
      .filter((token) => token.token.length > 0);
  }

  if (typeof config[STORAGE_KEYS.CONTEXT_MENU_ENABLED] === 'boolean') {
    sanitized[STORAGE_KEYS.CONTEXT_MENU_ENABLED] = config[STORAGE_KEYS.CONTEXT_MENU_ENABLED];
  }

  if (typeof config[STORAGE_KEYS.CONTEXT_MENU_PRIORITY] === 'number') {
    sanitized[STORAGE_KEYS.CONTEXT_MENU_PRIORITY] = Math.max(
      0,
      Math.min(10, config[STORAGE_KEYS.CONTEXT_MENU_PRIORITY])
    );
  }

  if (config[STORAGE_KEYS.CONTEXT_MENU_TOKEN]) {
    sanitized[STORAGE_KEYS.CONTEXT_MENU_TOKEN] = config[STORAGE_KEYS.CONTEXT_MENU_TOKEN].trim();
  }

  if (config[STORAGE_KEYS.LAST_SELECTED_TOKEN]) {
    sanitized[STORAGE_KEYS.LAST_SELECTED_TOKEN] = config[STORAGE_KEYS.LAST_SELECTED_TOKEN].trim();
  }

  if (config[STORAGE_KEYS.USER_LANG]) {
    sanitized[STORAGE_KEYS.USER_LANG] = config[STORAGE_KEYS.USER_LANG].trim();
  }

  return sanitized;
}
