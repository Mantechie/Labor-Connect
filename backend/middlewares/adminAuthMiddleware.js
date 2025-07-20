import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import asyncHandler from 'express-async-handler'

// 🔐 Protect admin routes
export const protectAdmin = asyncHandler(async (req, res, next) => {
  let token

  console.log('🔍 Admin Middleware: Checking request:', {
    url: req.url,
    method: req.method,
    hasAuthHeader: !!req.headers.authorization,
    authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'null'
  });

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      console.log('🔍 Admin Middleware: Token extracted:', token.substring(0, 20) + '...');

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log('🔍 Admin Middleware: Token decoded:', {
        id: decoded.id,
        role: decoded.role,
        hasRole: !!decoded.role,
        iat: decoded.iat,
        exp: decoded.exp
      });

      // Check if it's an admin token (has role field)
      if (!decoded.role) {
        console.log('❌ Admin Middleware: Token missing role field');
        res.status(401)
        throw new Error('Invalid admin token - missing role')
      }

      console.log('🔍 Admin Middleware: Looking for admin with ID:', decoded.id);
      req.admin = await Admin.findById(decoded.id).select('-password')

      if (!req.admin) {
        console.log('❌ Admin Middleware: Admin not found in database');
        res.status(401)
        throw new Error('Admin not found')
      }

      // Check if admin is active
      if (!req.admin.isActive) {
        console.log('❌ Admin Middleware: Admin account is deactivated');
        res.status(401)
        throw new Error('Admin account is deactivated')
      }

      // Verify token is stored in database and valid
      if (!req.admin.isTokenValid(token)) {
        console.log('❌ Admin Middleware: Token not valid in database');
        res.status(401)
        throw new Error('Token not valid or expired')
      }

      // Update last activity
      await req.admin.updateActivity();

      console.log('✅ Admin Middleware: Authentication successful');
      next()
    } catch (error) {
      console.error('❌ Admin Middleware: JWT verification error:', error.message);
      res.status(401)
      throw new Error('Not authorized, admin token failed')
    }
  }

  if (!token) {
    console.log('❌ Admin Middleware: No token provided');
    res.status(401)
    throw new Error('Not authorized, no admin token')
  }
})

// 🛡 Super admin-only access
export const isSuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'super_admin') {
    next()
  } else {
    res.status(403)
    throw new Error('Not authorized as super admin')
  }
}

// 🛡 Admin role check
export const hasAdminRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.admin && req.admin.role === requiredRole) {
      next()
    } else {
      res.status(403)
      throw new Error(`Not authorized as ${requiredRole}`)
    }
  }
}

// 🛡 Admin permission check
export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (req.admin && req.admin.permissions && req.admin.permissions.includes(permission)) {
      next()
    } else {
      res.status(403)
      throw new Error(`Not authorized for ${permission} permission`)
    }
  }
}

// 🛡 Check if admin is logged in (for OTP operations)
export const requireLoggedInAdmin = (req, res, next) => {
  if (req.admin && req.admin.isLoggedIn) {
    next()
  } else {
    res.status(401)
    throw new Error('Admin must be logged in')
  }
}

// 🛡 Check if admin has verified OTP (for sensitive operations)
export const requireOTPVerification = (req, res, next) => {
  if (req.admin && req.admin.otpVerified) {
    next()
  } else {
    res.status(401)
    throw new Error('OTP verification required')
  }
} 