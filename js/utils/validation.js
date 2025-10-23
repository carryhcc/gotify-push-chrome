/**
 * validation.js - Input validation utilities
 * Provides common validation functions for form inputs and data
 */

/**
 * Validates a URL string
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL, false otherwise
 */
export function isValidUrl(url) {
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
 * Validates a Gotify token format
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid token format, false otherwise
 */
export function isValidToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const trimmedToken = token.trim();

  // Gotify tokens should be non-empty and at least 5 characters
  // Allow alphanumeric characters, plus, slash, equals, dash, underscore, dot
  return trimmedToken.length >= 5 && /^[A-Za-z0-9+/=_.-]+$/.test(trimmedToken);
}

/**
 * Validates priority value
 * @param {number|string} priority - Priority value to validate
 * @returns {boolean} True if valid priority (0-10), false otherwise
 */
export function isValidPriority(priority) {
  const num = typeof priority === 'string' ? parseInt(priority, 10) : priority;
  return Number.isInteger(num) && num >= 0 && num <= 10;
}

/**
 * Validates that a string is not empty after trimming
 * @param {string} str - String to validate
 * @returns {boolean} True if non-empty, false otherwise
 */
export function isNonEmptyString(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Validates email format (basic validation)
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format, false otherwise
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitizes HTML content to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validates form data for Gotify push
 * @param {Object} formData - Form data object
 * @param {string} formData.title - Push title
 * @param {string} formData.message - Push message
 * @param {number} formData.priority - Push priority
 * @param {string} formData.token - Gotify token
 * @returns {Object} Validation result with isValid and errors
 */
export function validatePushForm(formData) {
  const errors = [];

  if (!isNonEmptyString(formData.message)) {
    errors.push('Message is required');
  }

  if (formData.title && formData.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }

  if (formData.message && formData.message.length > 1000) {
    errors.push('Message must be 1000 characters or less');
  }

  if (!isValidPriority(formData.priority)) {
    errors.push('Priority must be between 0 and 10');
  }

  if (!isValidToken(formData.token)) {
    errors.push('Valid token is required');
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Validates configuration data
 * @param {Object} config - Configuration object
 * @param {string} config.gotifyUrl - Gotify server URL
 * @param {Array} config.gotifyTokens - Array of token objects
 * @param {Object} i18nStrings - Internationalization strings object
 * @returns {Object} Validation result with isValid and errors
 */
export function validateConfig(config, i18nStrings = {}) {
  const errors = [];

  if (!isValidUrl(config.gotifyUrl)) {
    errors.push(i18nStrings.validationUrlRequired || 'Valid Gotify server URL is required');
  }

  if (!Array.isArray(config.gotifyTokens) || config.gotifyTokens.length === 0) {
    errors.push(i18nStrings.validationAtLeastOneToken || 'At least one token is required');
  } else {
    config.gotifyTokens.forEach((tokenInfo, index) => {
      if (!isNonEmptyString(tokenInfo.remark)) {
        const remarkError = i18nStrings.validationRemarkRequired || 'Remark is required';
        errors.push(`Token ${index + 1}: ${remarkError}`);
      }
      if (!isValidToken(tokenInfo.token)) {
        const tokenError = i18nStrings.validationTokenRequired || 'Valid token is required';
        errors.push(`Token ${index + 1}: ${tokenError}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}
