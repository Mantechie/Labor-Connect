import express from 'express'
import {
  register,
  login,
  sendOtp,
  verifyOtp,
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

export default router
