import AppError from '../utils/AppError.js';

// Development error handler - with full details
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Production error handler - limited details
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // Log error for developers
    console.error('ERROR 💥', err);
    
    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// Handle JWT errors
const handleJWTError = () => 
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => 
  new AppError('Your token has expired. Please log in again.', 401);

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    
    // Handle specific error types
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendErrorProd(error, res);
  }
};
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


export default errorHandler;
