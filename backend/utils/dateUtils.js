/**
 * Parse and validate a date string
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} The parsed Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
};

/**
 * Check if a date string is valid
 * @param {string} dateString - The date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Get end of day for a given date
 * @param {Date} date - The date to get end of day for
 * @returns {Date} Date set to 23:59:59.999
 */
export const getEndOfDay = (date) => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};
