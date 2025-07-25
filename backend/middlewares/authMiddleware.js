import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncHandler from 'express-async-handler'
import { verifyAccessToken } from '../utils/tokenUtils.js'

// 🔐 Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = verifyAccessToken(token)

      req.user = await User.findById(decoded.id).select('-password -refreshToken')

      if (!req.user) {
        res.status(401)
        throw new Error('User not found')
      }

      // Check if user is active
      if (!req.user.isActive || req.user.status !== 'active') {
        res.status(403)
        throw new Error('Account is inactive or suspended')
      }

      // Add token metadata to request for logging/tracking
      req.tokenMetadata = decoded.metadata || {}


      next()
    } catch (error) {
      console.error('Authentication error:', error.message)
      res.status(error.statusCode || 401)
      throw new Error(error.message || 'Not authorized, token failed')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

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
