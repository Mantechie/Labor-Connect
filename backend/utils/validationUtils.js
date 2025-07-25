// h:\Labour\backend\utils\validationUtils.js

import mongoose from 'mongoose';

/**
 * Check if a value is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Check if a value is included in an allowed list
 * @param {string} value - The value to check
 * @param {Array} allowedValues - List of allowed values
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

/**
 * Validate and sanitize pagination parameters
 * @param {number|string} page - The page number
 * @param {number|string} limit - The page size
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {Object} Object with sanitized page and limit values
 */
export const validatePagination = (page, limit, maxLimit = 100) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  return {
    page: isNaN(pageNum) || pageNum < 1 ? 1 : pageNum,
    limit: isNaN(limitNum) || limitNum < 1 ? 10 : Math.min(limitNum, maxLimit)
  };
};

/**
 * Sanitize a string to prevent XSS
 * @param {string} str - The string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Mask sensitive information in a string
 * @param {string} str - The string to mask
 * @param {number} visibleChars - Number of characters to show at start and end
 * @returns {string} Masked string
 */
export const maskSensitiveData = (str, visibleChars = 1) => {
  if (!str) return '';
  if (str.length <= visibleChars * 2) return '*'.repeat(str.length);
  
  const start = str.substring(0, visibleChars);
  const end = str.substring(str.length - visibleChars);
  const masked = '*'.repeat(Math.max(str.length - (visibleChars * 2), 1));
  
  return start + masked + end;
};

/**
 * Mask email address
 * @param {string} email - The email to mask
 * @returns {string} Masked email
 */
export const maskEmail = (email) => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (!domain) return maskSensitiveData(email);
  
  return `${username.charAt(0)}${'*'.repeat(Math.max(username.length - 2, 1))}${username.charAt(username.length - 1)}@${domain}`;
};

/**
 * Mask IP address
 * @param {string} ip - The IP address to mask
 * @returns {string} Masked IP
 */
export const maskIpAddress = (ip) => {
  if (!ip) return '';
  return ip.split('.').map((octet, index) => index < 2 ? octet : 'xxx').join('.');
};
