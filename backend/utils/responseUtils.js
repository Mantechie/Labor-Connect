/**
 * Standardized success response
 * 
 * @param {Object} res - Express response object
 * @param {Object} data - Data to return
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 * @returns {Object} Formatted response
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Standardized error response
 * 
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {Object|Array} errors - Detailed errors
 * @returns {Object} Formatted response
 */
export const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};
