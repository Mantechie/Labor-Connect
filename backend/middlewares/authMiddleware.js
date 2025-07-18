import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncHandler from 'express-async-handler'

// 🔐 Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        res.status(401)
        throw new Error('User not found')
      }

      next()
    } catch (error) {
      console.error(error)
      res.status(401)
      throw new Error('Not authorized, token failed')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

// 🛡 Admin-only access
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(403)
    throw new Error('Not authorized as admin')
  }
}
