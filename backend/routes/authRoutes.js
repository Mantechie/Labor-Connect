import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  getCurrentUser,
  refreshToken,
  logout,
} from '../controllers/authController.js'

const router = express.Router()

// 📌 POST /api/auth/register - User Registration
router.post('/register', register)

// 📌 POST /api/auth/login - User Login
router.post('/login', login)

// 📌 POST /api/auth/send-otp - Send OTP via Email/SMS
router.post('/send-otp', sendOtp)

// 📌 POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', verifyOtp)

// 📌 POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshToken)

// 📌 POST /api/auth/logout - Logout user
router.post('/logout', protect, logout)

// 📌 GET /api/auth/me - Get current user
router.get('/me', protect, getCurrentUser)

export default router
