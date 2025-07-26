// Custom error handler middleware
import { logger } from '../utils/Logger.js';

// ❗ Not Found Handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
} 

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error with context
  logger.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    userId: req.user?.id || 'unauthenticated',
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: process.env.NODE_ENV === 'production' ? '[REDACTED]' : req.body
  });
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};