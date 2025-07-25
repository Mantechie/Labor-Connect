// h:\Labour\backend\middlewares\adminRateLimiter.js

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for admin log endpoints
 */
export const adminLogLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many log requests, please try again after 5 minutes'
  }
});

/**
 * Stricter rate limiter for log export endpoint
 */
export const logExportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Export rate limit exceeded, please try again later'
  }
});

/**
 * Rate limiter for security-sensitive operations
 */
export const securityOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many security operations, please try again later'
  }
});
