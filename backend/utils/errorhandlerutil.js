/**
 * Standardized controller error handler
 * @param {Error} error - The error object
 * @param {Response} res - Express response object
 * @param {string} operation - Description of the operation that failed
 * @param {number} statusCode - HTTP status code (default: 500)
 */
export const handleControllerError = (error, res, operation, statusCode = 500) => {
  console.error(`${operation} error:`, error);
  
  // Include error details in development, but not in production
  const errorDetails = process.env.NODE_ENV === 'development' 
    ? { error: error.message, stack: error.stack }
    : undefined;
  
  res.status(statusCode).json({ 
    success: false,
    message: `Failed to ${operation}`,
    ...errorDetails
  });
};

/**
 * Async handler to eliminate try/catch blocks in controllers
 * @param {Function} fn - The async function to handle
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(`Error in ${fn.name || 'anonymous function'}:`, err);
    res.status(500).json({ 
      message: 'An error occurred while processing your request',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  });
};

/**
 * Structured error logger that avoids logging sensitive information
 * @param {string} context - The context where the error occurred
 * @param {Error} error - The error object
 * @param {Object} metadata - Additional metadata to log
 */
export const logError = (context, error, metadata = {}) => {
  // Remove sensitive data from metadata
  const sanitizedMetadata = { ...metadata };
  
  // List of keys that might contain sensitive information
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie'];
  
  // Sanitize sensitive keys
  Object.keys(sanitizedMetadata).forEach(key => {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitizedMetadata[key] = '[REDACTED]';
    }
  });
  
  console.error({
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    ...sanitizedMetadata
  });
};