/**
 * errorHandler.js - Error handling utilities
 * Provides centralized error handling and user-friendly error messages
 */

/**
 * Error types for different categories of errors
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Maps HTTP status codes to error types
 * @param {number} status - HTTP status code
 * @returns {string} Error type
 */
function getErrorTypeFromStatus(status) {
  if (status >= 400 && status < 500) {
    if (status === 401 || status === 403) {
      return ERROR_TYPES.AUTHENTICATION;
    }
    return ERROR_TYPES.VALIDATION;
  }
  if (status >= 500) {
    return ERROR_TYPES.SERVER;
  }
  return ERROR_TYPES.UNKNOWN;
}

/**
 * Creates a user-friendly error message
 * @param {Error|Object} error - Error object or error info
 * @param {string} context - Context where error occurred
 * @returns {Object} Error info with type, message, and user message
 */
export function createErrorInfo(error, context = '') {
  let errorType = ERROR_TYPES.UNKNOWN;
  let message = 'An unknown error occurred';
  let userMessage = 'Something went wrong. Please try again.';

  if (error instanceof Error) {
    message = error.message;

    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorType = ERROR_TYPES.NETWORK;
      userMessage =
        'Unable to connect to the server. Please check your internet connection and server URL.';
    }
    // HTTP errors
    else if (error.message.includes('HTTP')) {
      const statusMatch = error.message.match(/HTTP (\d+)/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1], 10);
        errorType = getErrorTypeFromStatus(status);

        switch (status) {
          case 400:
            userMessage = 'Invalid request. Please check your input and try again.';
            break;
          case 401:
            userMessage = 'Authentication failed. Please check your token.';
            break;
          case 403:
            userMessage = 'Access denied. Please check your token permissions or CORS settings.';
            break;
          case 404:
            userMessage = 'Server not found. Please check your server URL.';
            break;
          case 500:
            userMessage = 'Server error. Please try again later.';
            break;
          default:
            userMessage = `Server returned error ${status}. Please check your configuration.`;
        }
      }
    }
  } else if (typeof error === 'object' && error.status) {
    errorType = getErrorTypeFromStatus(error.status);
    message = error.message || `HTTP ${error.status}`;

    switch (error.status) {
      case 400:
        userMessage = 'Invalid request. Please check your input and try again.';
        break;
      case 401:
        userMessage = 'Authentication failed. Please check your token.';
        break;
      case 403:
        userMessage = 'Access denied. Please check your token permissions or CORS settings.';
        break;
      case 404:
        userMessage = 'Server not found. Please check your server URL.';
        break;
      case 500:
        userMessage = 'Server error. Please try again later.';
        break;
      default:
        userMessage = `Server returned error ${error.status}. Please check your configuration.`;
    }
  }

  return {
    type: errorType,
    message: message,
    userMessage: userMessage,
    context: context,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Logs error information to console
 * @param {Object} errorInfo - Error info object
 */
export function logError(_errorInfo) {
  // Log error information for debugging
  // console.error(`[${_errorInfo.type}] ${_errorInfo.context}:`, {
  //   message: _errorInfo.message,
  //   userMessage: _errorInfo.userMessage,
  //   timestamp: _errorInfo.timestamp
  // });
}

/**
 * Handles fetch errors and returns appropriate error info
 * @param {Response} response - Fetch response object
 * @param {string} context - Context where error occurred
 * @returns {Promise<Object>} Error info object
 */
export async function handleFetchError(response, context = '') {
  let errorMessage = `HTTP ${response.status}`;

  try {
    const errorText = await response.text();
    let errorDetail = errorText;

    try {
      const errorJson = JSON.parse(errorText);
      errorDetail = errorJson.error_description || errorJson.error || errorText;
    } catch {
      // Not JSON, use text as is
    }

    errorMessage = `HTTP ${response.status}: ${errorDetail}`;
  } catch {
    // If we can't read the response, use status only
  }

  const error = new Error(errorMessage);
  error.status = response.status;

  return createErrorInfo(error, context);
}

/**
 * Wraps async functions with error handling
 * @param {Function} asyncFn - Async function to wrap
 * @param {string} context - Context for error logging
 * @returns {Function} Wrapped function with error handling
 */
export function withErrorHandling(asyncFn, context = '') {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const errorInfo = createErrorInfo(error, context);
      logError(errorInfo);
      throw errorInfo;
    }
  };
}

/**
 * Shows error notification to user
 * @param {Object} errorInfo - Error info object
 * @param {Function} showNotification - Function to show notification
 */
export function showErrorNotification(errorInfo, showNotification) {
  if (typeof showNotification === 'function') {
    showNotification(errorInfo.userMessage, 'error');
  } else {
    // Error notification function not provided
    // console.error('Error notification function not provided:', errorInfo);
  }
}
