import bcrypt from 'bcryptjs' // PAssword hashing library
import jwt from 'jsonwebtoken' // Generating JWT tokens
import User from '../models/User.js' // User model
import OTP from '../models/OTP.js' // OTP model
import generateOTP from '../utils/generateOTP.js' // Generate OTP
import sendEmail from '../utils/sendEmail.js' // Or use sendSMS

import dotenv from 'dotenv' //Loads env variables (JWT_SECRET)
 
dotenv.config() //Initialize env variables 

// Generate JWT
const generateToken = (id, role) => {
  // Creates a signed JWT containing ID,role
  // Uses JWT_SECRET from .env to sign the token
  // Tokens expire after 7 days
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

// @desc    Register new user/laborer
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body //Destructure request body

    // Check if user already exists
    // Prevents duplicate emails
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    //  Uses bcrypt for secure storage
    const salt = await bcrypt.genSalt(10) // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt) //Hash password + salt

    // Create user
    // Saves hashed password and role
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Store hashed password (never plaintext!)
      role, // 'user' or 'laborer' or 'admin'
    })

    await newUser.save()  // Save to database
    
    // Respond with user data + token
    //  Excludes password for security
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        // Generate JWT that returns token for immediate login after registration
        token: generateToken(newUser._id, newUser.role), 
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc    Login user/laborer/admin
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    // find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Compare passwords
    // Uses bcrypt.compare to match hashed passwords
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    
    // Respond with user data + token
    // Return token immediately after login
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc Send OTP to email before registration
// @route POST /api/auth/send-otp
export const sendOtp = async (req, res) => {
  const { email } = req.body

  const otp = generateOTP() // e.g., returns 6-digit string
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min expiry

  await OTP.deleteMany({ email }) // Remove old OTPs

  const newOtp = new OTP({ email, otp, expiresAt })
  await newOtp.save()

  // Send OTP via Email 
  await sendEmail({
    to: email,
    subject: 'Labor Connect - OTP Verification',
    text: `Your OTP is ${otp}`,
    html: `<h2>Your OTP is: <strong>${otp}</strong></h2>`
  })

  res.status(200).json({ message: 'OTP sent to your email' })
}

// @desc Verify OTP before registration or login
// @route POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body

  const existingOtp = await OTP.findOne({ email, otp })

  if (!existingOtp || existingOtp.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' })
  }

  await OTP.deleteMany({ email }) // Clear OTP after verification
  res.status(200).json({ message: 'OTP verified successfully' })
}
