/**
 * ui.js - UI utilities
 * Provides reusable functions for common UI operations
 */

/**
 * Shows a status message to the user
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success', 'error', 'info')
 * @param {number} duration - Auto-hide duration in milliseconds (0 = no auto-hide)
 */
export function showStatusMessage(message, type = 'info', duration = 3000) {
  const statusElement = document.getElementById('status');
  if (!statusElement) {
    // Status element not found
    return;
  }

  // Clear previous status
  statusElement.className = 'status';
  statusElement.textContent = '';

  // Set message and type
  statusElement.innerHTML = message;
  statusElement.className = `status ${type}`;

  // Auto-hide for non-error messages
  if (type !== 'error' && duration > 0) {
    setTimeout(() => {
      if (statusElement.innerHTML === message) {
        statusElement.className = 'status';
        statusElement.innerHTML = '';
      }
    }, duration);
  }
}

/**
 * Creates a loading state for an element
 * @param {HTMLElement} element - Element to show loading state for
 * @param {boolean} isLoading - Whether to show or hide loading state
 */
export function setLoadingState(element, isLoading) {
  if (!element) return;

  if (isLoading) {
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.textContent = 'Loading...';
    element.classList.add('loading');
  } else {
    element.disabled = false;
    if (element.dataset.originalText) {
      element.textContent = element.dataset.originalText;
      delete element.dataset.originalText;
    }
    element.classList.remove('loading');
  }
}

/**
 * Creates a dropdown option element
 * @param {string} value - Option value
 * @param {string} text - Option text
 * @param {boolean} selected - Whether option is selected
 * @returns {HTMLOptionElement} Option element
 */
export function createOption(value, text, selected = false) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  option.selected = selected;
  return option;
}

/**
 * Populates a select element with options
 * @param {HTMLSelectElement} selectElement - Select element to populate
 * @param {Array} options - Array of option objects {value, text, selected}
 * @param {boolean} clearExisting - Whether to clear existing options
 */
export function populateSelect(selectElement, options, clearExisting = true) {
  if (!selectElement) return;

  if (clearExisting) {
    selectElement.innerHTML = '';
  }

  options.forEach((option) => {
    const optionElement = createOption(option.value, option.text, option.selected);
    selectElement.appendChild(optionElement);
  });
}

/**
 * Validates and highlights form fields
 * @param {HTMLFormElement} form - Form element to validate
 * @param {Object} validationRules - Validation rules object
 * @returns {boolean} True if form is valid
 */
export function validateForm(form, validationRules) {
  let isValid = true;

  // Clear previous validation states
  form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
  form.querySelectorAll('.error-message').forEach((el) => el.remove());

  Object.keys(validationRules).forEach((fieldName) => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    const rules = validationRules[fieldName];
    const value = field.value.trim();

    // Required validation
    if (rules.required && !value) {
      showFieldError(field, rules.requiredMessage || `${fieldName} is required`);
      isValid = false;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return;

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      showFieldError(field, rules.patternMessage || `${fieldName} format is invalid`);
      isValid = false;
      return;
    }

    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
      showFieldError(
        field,
        rules.minLengthMessage || `${fieldName} must be at least ${rules.minLength} characters`
      );
      isValid = false;
      return;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      showFieldError(
        field,
        rules.maxLengthMessage || `${fieldName} must be no more than ${rules.maxLength} characters`
      );
      isValid = false;
      return;
    }

    // Custom validation function
    if (rules.custom && !rules.custom(value)) {
      showFieldError(field, rules.customMessage || `${fieldName} is invalid`);
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Shows error state for a form field
 * @param {HTMLElement} field - Form field element
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
  field.classList.add('error');

  // Remove existing error message
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Add new error message
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.color = 'var(--color-danger)';
  errorElement.style.fontSize = 'var(--font-size-sm)';
  errorElement.style.marginTop = 'var(--space-xs)';

  field.parentNode.appendChild(errorElement);
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttles a function call
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Failed to copy to clipboard
    return false;
  }
}

/**
 * Formats a date for display
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const formatOptions = { ...defaultOptions, ...options };

  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(undefined, formatOptions);
  } catch (error) {
    // Failed to format date
    return 'Invalid Date';
  }
}
