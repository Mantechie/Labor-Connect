import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again after 15 minutes'
  }
});

// Very strict rate limiter for OTP endpoints
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many OTP requests, please try again after 10 minutes'
  }
});

// Job creation rate limiter
export const createJobLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each user to 5 job posts per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use authenticated user ID
    if (req.user && req.user.id) {
      return `user_\${req.user.id}`;
    }
    // Fallback to IP address
    return ipKeyGenerator(req);
  },
  message: {
    status: 'error',
    message: 'Too many job post attempts, please try again after an hour'
  }
});

// Chat rate limiter
export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each user to 20 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // If user is authenticated, use their ID
    if (req.user && req.user.id) {
      return `user_\${req.user.id}`;
    }
    // Otherwise use IP address with IPv6 safe key generator
    return ipKeyGenerator(req);
  },
  // Rate limit by user ID if authenticated, IP otherwise
  message: {
    status: 'error',
    message: 'Too many messages sent, please slow down'
  }
});