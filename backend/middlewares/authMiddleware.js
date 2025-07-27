import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncHandler from 'express-async-handler'
import { verifyAccessToken } from '../utils/tokenUtils.js'
import { isTokenBlacklisted } from '../utils/tokenBlacklist.js';

export const protect = async (req, res, next) => {
  try {
    // Get token from cookie instead of Authorization header
    const token = req.cookies.access_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ message: 'Token has been invalidated' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
}

// 🛡 Admin-only access
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403)
    throw new Error('Not authorized as admin')
  }
}

/**
 * Middleware to restrict access based on user role
 * Must be used after the protect middleware
 * @param {string[]} roles - Array of allowed roles
 */
export const hasRole = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next()
    } else {
      res.status(403)
      throw new Error('Not authorized for this action')
    }
  }
}
