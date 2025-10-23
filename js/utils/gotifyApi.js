/**
 * gotifyApi.js - Gotify API utilities
 * Provides reusable functions for interacting with Gotify server
 */

import { handleFetchError } from './errorHandler.js';

/**
 * Default Gotify API configuration
 */
const DEFAULT_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 1,
};

/**
 * Sends a push message to Gotify server
 * @param {Object} options - Push options
 * @param {string} options.url - Gotify server URL
 * @param {string} options.token - Gotify token
 * @param {string} options.title - Message title
 * @param {string} options.message - Message content
 * @param {number} options.priority - Message priority (0-10)
 * @param {Object} options.config - Additional configuration
 * @returns {Promise<Object>} Response data
 */
export async function sendPushMessage({
  url,
  token,
  title,
  message,
  priority = 5,
  config = DEFAULT_CONFIG,
}) {
  // Validate required parameters
  if (!url || !token || !message) {
    throw new Error('URL, token, and message are required');
  }

  // Build API URL
  const apiUrl = url.replace(/\/$/, '') + '/message';

  // Prepare request data
  const data = {
    title: title || 'default',
    message: message,
    priority: Math.max(0, Math.min(10, priority)),
  };

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gotify-Key': token,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorInfo = await handleFetchError(response, 'Gotify API Request');
      throw errorInfo;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server did not respond in time');
    }

    throw error;
  }
}

/**
 * Tests connection to Gotify server
 * @param {string} url - Gotify server URL
 * @param {string} token - Gotify token
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection(url, token) {
  try {
    await sendPushMessage({
      url,
      token,
      title: 'Connection Test',
      message: 'Testing connection to Gotify server',
      priority: 0,
    });
    return true;
  } catch (error) {
    // Connection test failed - this is expected in some cases
    return false;
  }
}

/**
 * Gets server information from Gotify
 * @param {string} url - Gotify server URL
 * @returns {Promise<Object>} Server information
 */
export async function getServerInfo(url) {
  const apiUrl = url.replace(/\/$/, '') + '/version';

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorInfo = await handleFetchError(response, 'Get Server Info');
    throw errorInfo;
  }

  return await response.json();
}

/**
 * Validates Gotify server URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid Gotify URL
 */
export function isValidGotifyUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Builds complete Gotify API URL
 * @param {string} baseUrl - Base Gotify server URL
 * @param {string} endpoint - API endpoint
 * @returns {string} Complete API URL
 */
export function buildApiUrl(baseUrl, endpoint = '') {
  const cleanUrl = baseUrl.replace(/\/$/, '');
  return endpoint ? `${cleanUrl}/${endpoint}` : cleanUrl;
}
