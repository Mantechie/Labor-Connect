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
  // Tokens expire after 30 days for better user experience
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '60d', // Refresh token lasts 60 days
  })
}

// @desc    Register new user/laborer
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body //Destructure request body

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
      phone: phone || '', // Include phone if provided
    })

    await newUser.save()  // Save to database
    
    // Generate tokens
    const token = generateToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken(newUser._id);
    
    // Store refresh token in user document
    newUser.refreshToken = refreshToken;
    await newUser.save();
    
    // Respond with user data + tokens
    //  Excludes password for security
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        token: token,
        refreshToken: refreshToken,
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
    
    // Generate tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    // Store refresh token in user document
    user.refreshToken = refreshToken;
    await user.save();
    
    // Respond with user data + tokens
    // Return token immediately after login
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: token,
        refreshToken: refreshToken,
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc Send OTP to email/phone for login
// @route POST /api/auth/send-otp
export const sendOtp = async (req, res) => {
  try {
    const { email, phone } = req.body

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone number is required' })
    }

    // Check if user exists
    let user;
    if (email) {
      user = await User.findOne({ email })
    } else if (phone) {
      user = await User.findOne({ phone })
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' })
    }

    const otpCode = generateOTP() // Generate 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min expiry

    // Remove old OTPs for this user
    if (email) {
      await OTP.deleteMany({ email })
    } else if (phone) {
      await OTP.deleteMany({ phone })
    }

    // Create new OTP
    const newOtp = new OTP({
      email: email || user.email,
      phone: phone || user.phone,
      otpCode,
      expiresAt,
      type: email ? 'email' : 'sms'
    })

    await newOtp.save()

    // Send OTP via Email (for now, we'll focus on email)
    if (email) {
      try {
        const emailResult = await sendEmail({
          to: email,
          subject: 'LabourConnect - OTP Verification',
          text: `Your OTP is ${otpCode}. Valid for 10 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0D47A1;">🔐 OTP Verification</h2>
              <p>Hello ${user.name},</p>
              <p>Your OTP for LabourConnect login is:</p>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h1 style="color: #0D47A1; font-size: 32px; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
              </div>
              <p><strong>Valid for 10 minutes</strong></p>
              <p>If you didn't request this OTP, please ignore this email.</p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">LabourConnect - Connecting Labour with Opportunities</p>
            </div>
          `
        })
        
        const responseData = {
          message: 'OTP sent to your email',
          email: email,
          expiresIn: '10 minutes'
        };
        
        // Add preview URL for development
        if (emailResult && emailResult.previewUrl) {
          responseData.previewUrl = emailResult.previewUrl;
          console.log(`🔗 Email Preview URL: ${emailResult.previewUrl}`);
        }
        
        res.status(200).json(responseData);
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        res.status(500).json({ message: 'Failed to send OTP email. Please try again.' })
      }
    } else {
      // For SMS, you would implement SMS sending here
      res.status(200).json({ 
        message: 'OTP sent to your phone',
        phone: phone,
        expiresIn: '10 minutes'
      })
    }
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' })
  }
}

// @desc Verify OTP and login user
// @route POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, phone, otp } = req.body

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone number is required' })
    }

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' })
    }

    // Find OTP record
    let otpRecord;
    if (email) {
      otpRecord = await OTP.findOne({ email, otpCode: otp })
    } else if (phone) {
      otpRecord = await OTP.findOne({ phone, otpCode: otp })
    }

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteMany({ email: otpRecord.email, phone: otpRecord.phone })
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      return res.status(400).json({ message: 'OTP has already been used' })
    }

    // Find user
    let user;
    if (email) {
      user = await User.findOne({ email })
    } else if (phone) {
      user = await User.findOne({ phone })
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Mark OTP as used
    otpRecord.isUsed = true
    await otpRecord.save()

    // Clear all OTPs for this user
    if (email) {
      await OTP.deleteMany({ email })
    } else if (phone) {
      await OTP.deleteMany({ phone })
    }

    // Generate JWT token and return user data
    const token = generateToken(user._id, user.role)

    res.status(200).json({
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: token,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ message: 'Failed to verify OTP. Please try again.' })
  }
}

// @desc    Refresh access token
// @route   POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Find user with this refresh token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const newToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    
    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user (invalidate refresh token)
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Clear refresh token from user document
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
