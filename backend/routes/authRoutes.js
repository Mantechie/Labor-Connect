import express from 'express'
import {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
} from '../controllers/authController.js'

const router = express.Router()

// 📌 POST /api/auth/register - User Registration
router.post('/register', registerUser)

// 📌 POST /api/auth/login - User Login
router.post('/login', loginUser)

// 📌 POST /api/auth/send-otp - Send OTP via Email/SMS
router.post('/send-otp', sendOTP)

// 📌 POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', verifyOTP)

export default router
