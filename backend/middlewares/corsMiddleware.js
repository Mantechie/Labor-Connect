import config from '../config/env.js';

/**
 * Custom CORS middleware for debugging and additional CORS handling
 */
export const corsDebugMiddleware = (req, res, next) => {
  const origin = req.get('Origin');
  
  // Log CORS requests for debugging
  if (config.NODE_ENV === 'development') {
    console.log(`🌐 CORS Request: ${req.method} ${req.path} from origin: ${origin || 'no-origin'}`);
  }
  
  next();
};

/**
 * Middleware to ensure credentials are properly set for authenticated requests
 */
export const credentialsMiddleware = (req, res, next) => {
  // Ensure credentials are allowed for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

/**
 * Preflight handler for complex CORS requests
 */
export const preflightHandler = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-HTTP-Method-Override');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.setHeader('Content-Length', '0');
    return res.status(204).end();
  }
  next();
};

/**
 * CORS origin validator
 */
export const validateCorsOrigin = (origin) => {
  if (!origin) return true; // Allow requests with no origin (mobile apps, etc.)
  
  // In development, allow localhost with any port
  if (config.NODE_ENV === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }
  }
  
  // Check against configured origins
  const allowedOrigins = config.CORS_ORIGIN.split(',').map(origin => origin.trim());
  return allowedOrigins.includes(origin);
};

export default {
  corsDebugMiddleware,
  credentialsMiddleware,
  preflightHandler,
  validateCorsOrigin
};