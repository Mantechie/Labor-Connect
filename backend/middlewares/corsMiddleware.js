// Enhanced corsMiddleware.js with monitoring

import config from '../config/env.js';
import { logger } from '../utils/Logger.js';

/**
 * Custom CORS middleware for debugging and additional CORS handling
 */
export const corsDebugMiddleware = (req, res, next) => {
  const origin = req.get('Origin');
  const userAgent = req.get('User-Agent');
  
  // Log CORS requests for debugging
  if (config.NODE_ENV === 'development') {
    console.log(`🌐 CORS Request: ${req.method} ${req.path}`);
    console.log(`   Origin: ${origin || 'no-origin'}`);
    console.log(`   User-Agent: ${userAgent ? userAgent.substring(0, 50) + '...' : 'unknown'}`);
    console.log(`   Headers: ${JSON.stringify(req.headers, null, 2)}`);
  }
  
  next();
};

/**
 * Middleware to ensure credentials are properly set for authenticated requests
 * Enhanced with additional security headers
 */
export const credentialsMiddleware = (req, res, next) => {
  // Ensure credentials are allowed for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Add Referrer-Policy header
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add Permissions-Policy header
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
};

/**
 * Enhanced preflight handler for complex CORS requests with monitoring
 */
export const preflightHandler = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.get('Origin');
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    if (config.NODE_ENV === 'development') {
      console.log(`🔄 CORS Preflight: ${req.method} ${req.path} from ${origin || 'no-origin'}`);
    }
    
    // Validate origin and set appropriate headers
    if (validateCorsOrigin(origin)) {
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
      res.setHeader('Access-Control-Allow-Headers', [
        'Origin',
        'X-Requested-With', 
        'Content-Type', 
        'Accept', 
        'Authorization', 
        'Cache-Control', 
        'X-HTTP-Method-Override',
        'X-Forwarded-For',
        'X-Real-IP',
        'User-Agent',
        'Referer',
        'X-CSRF-Token'
      ].join(', '));
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      res.setHeader('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
      res.setHeader('Content-Length', '0');
      
      // Log successful preflight
      logger.http(`CORS_PREFLIGHT_SUCCESS | Origin: ${origin} | Path: ${req.path}`, {
        event: 'cors_preflight',
        origin,
        path: req.path,
        method: req.method,
        ip,
        userAgent,
        success: true
      });
      
      if (config.NODE_ENV === 'development') {
        console.log(`✅ CORS Preflight: Approved for ${origin}`);
      }
      
      return res.status(204).end();
    } else {
      // Reject preflight for invalid origins
      console.log(`❌ CORS Preflight: Rejected for ${origin}`);
      console.log(`   Allowed origins: ${config.CORS_ORIGIN}`);
      
      // Log failed preflight
      logger.warn(`CORS_PREFLIGHT_REJECTED | Origin: ${origin} | Path: ${req.path}`, {
        event: 'cors_preflight_rejected',
        origin,
        path: req.path,
        method: req.method,
        ip,
        userAgent,
        success: false,
        allowedOrigins: config.CORS_ORIGIN.split(',').map(o => o.trim())
      });
      
      return res.status(403).json({ 
        error: 'CORS policy violation',
        message: 'Origin not allowed by CORS policy',
        origin: origin,
        allowedOrigins: config.NODE_ENV === 'development' ? 
          config.CORS_ORIGIN.split(',').map(o => o.trim()) : 
          ['Contact administrator for allowed origins'],
        hint: config.NODE_ENV === 'production' ? 
          'Make sure your frontend domain is added to CORS_ORIGIN environment variable' :
          'Check if your origin matches the allowed development origins'
      });
    }
  }
  next();
};

/**
 * CORS origin validator with enhanced security and flexibility
 */
export const validateCorsOrigin = (origin) => {
  // Allow requests with no origin (mobile apps, Postman, server-to-server, etc.)
  if (!origin) return true;
  
  // Get configured origins
  const allowedOrigins = config.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);
  
  // In development, allow localhost and 127.0.0.1 with any port
  if (config.NODE_ENV === 'development') {
    const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    if (localhostPattern.test(origin)) {
      console.log(`✅ CORS: Allowing development origin: ${origin}`);
      return true;
    }
  }
  
  // Check exact match against configured origins
  if (allowedOrigins.includes(origin)) {
    console.log(`✅ CORS: Allowing configured origin: ${origin}`);
    return true;
  }
  
  // Allow common deployment platforms in production
  if (config.NODE_ENV === 'production') {
    const productionPatterns = [
      /^https:\/\/.*\.vercel\.app$/,           // Vercel deployments
      /*/^https:\/\/.*\.netlify\.app$/,         // Netlify deployments
      /^https:\/\/.*\.herokuapp\.com$/,       // Heroku deployments
      /^https:\/\/.*\.railway\.app$/,         // Railway deployments
      /^https:\/\/.*\.render\.com$/,          // Render deployments
      /^https:\/\/.*\.surge\.sh$/,            // Surge deployments
      /^https:\/\/.*\.github\.io$/,           // GitHub Pages
      /^https:\/\/.*\.firebaseapp\.com$/,     // Firebase hosting
      /^https:\/\/.*\.web\.app$/,             // Firebase web app */ 
    ];
    
    for (const pattern of productionPatterns) {
      if (pattern.test(origin)) {
        console.log(`✅ CORS: Allowing production platform origin: ${origin}`);
        return true;
      }
    }
    
    // Allow subdomain matching for configured domains
    for (const allowedOrigin of allowedOrigins) {
      if (allowedOrigin.startsWith('https://') && origin.endsWith(allowedOrigin.replace('https://', ''))) {
        console.log(`✅ CORS: Allowing subdomain origin: ${origin}`);
        return true;
      }
    }
  }
  
  console.log(`❌ CORS: Rejecting origin: ${origin}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
  
  // Log rejected origin
  logger.warn(`CORS_ORIGIN_REJECTED | Origin: ${origin}`, {
    event: 'cors_origin_rejected',
    origin,
    allowedOrigins: allowedOrigins
  });
  
  return false;
};

/**
 * CORS error handler middleware with enhanced logging
 */
export const corsErrorHandler = (err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    const origin = req.get('Origin');
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    console.error(`❌ CORS Error: ${err.message} for origin: ${origin}`);
    
    // Log CORS error
    logger.error(`CORS_ERROR | Origin: ${origin} | Message: ${err.message}`, {
      event: 'cors_error',
      origin,
      error: err.message,
      path: req.path,
      method: req.method,
      ip,
      userAgent
    });
    
    return res.status(403).json({
      error: 'CORS Policy Violation',
      message: 'Your request origin is not allowed by our CORS policy',
      origin: origin,
      allowedOrigins: config.NODE_ENV === 'development' ? 
        config.CORS_ORIGIN.split(',').map(o => o.trim()) : 
        ['Contact administrator for allowed origins'],
      timestamp: new Date().toISOString()
    });
  }
  
  next(err);
};

/**
 * Dynamic CORS origin setter for responses with monitoring
 */
export const dynamicCorsOrigin = (req, res, next) => {
  const origin = req.get('Origin');
  
  if (origin && validateCorsOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    
    // Log successful CORS request in production
    if (config.NODE_ENV === 'production') {
      logger.http(`CORS_REQUEST | Origin: ${origin} | Path: ${req.path}`, {
        event: 'cors_request',
        origin,
        path: req.path,
        method: req.method
      });
    }
  }
  
  next();
};

/**
 * CORS monitoring middleware to track metrics
 */
export const corsMonitoringMiddleware = (req, res, next) => {
  const origin = req.get('Origin');
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to capture metrics
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Only log in production or if explicitly enabled
    if (config.NODE_ENV === 'production' || config.CORS_MONITORING === 'true') {
      logger.http(`CORS_METRICS | Origin: ${origin || 'no-origin'} | Status: ${statusCode} | Time: ${responseTime}ms`, {
        event: 'cors_metrics',
        origin: origin || 'no-origin',
        path: req.path,
        method: req.method,
        statusCode,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
    
    // Call original end function
    return originalEnd.apply(this, args);
  };
  
  next();
};

export default {
  corsDebugMiddleware,
  credentialsMiddleware,
  preflightHandler,
  validateCorsOrigin,
  corsErrorHandler,
  dynamicCorsOrigin,
  corsMonitoringMiddleware
};
