import config from '../config/env.js';

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
 * Enhanced preflight handler for complex CORS requests
 */
export const preflightHandler = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.get('Origin');
    
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
        'Referer'
      ].join(', '));
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      res.setHeader('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
      res.setHeader('Content-Length', '0');
      
      if (config.NODE_ENV === 'development') {
        console.log(`✅ CORS Preflight: Approved for ${origin}`);
      }
      
      return res.status(204).end();
    } else {
      // Reject preflight for invalid origins
      console.log(`❌ CORS Preflight: Rejected for ${origin}`);
      console.log(`   Allowed origins: ${config.CORS_ORIGIN}`);
      
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
      /^https:\/\/.*\.netlify\.app$/,         // Netlify deployments
      /^https:\/\/.*\.herokuapp\.com$/,       // Heroku deployments
      /^https:\/\/.*\.railway\.app$/,         // Railway deployments
      /^https:\/\/.*\.render\.com$/,          // Render deployments
      /^https:\/\/.*\.surge\.sh$/,            // Surge deployments
      /^https:\/\/.*\.github\.io$/,           // GitHub Pages
      /^https:\/\/.*\.firebaseapp\.com$/,     // Firebase hosting
      /^https:\/\/.*\.web\.app$/,             // Firebase web app
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
  return false;
};

/**
 * CORS error handler middleware
 */
export const corsErrorHandler = (err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    const origin = req.get('Origin');
    
    console.error(`❌ CORS Error: ${err.message} for origin: ${origin}`);
    
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
 * Dynamic CORS origin setter for responses
 */
export const dynamicCorsOrigin = (req, res, next) => {
  const origin = req.get('Origin');
  
  if (origin && validateCorsOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  
  next();
};

export default {
  corsDebugMiddleware,
  credentialsMiddleware,
  preflightHandler,
  validateCorsOrigin,
  corsErrorHandler,
  dynamicCorsOrigin
};