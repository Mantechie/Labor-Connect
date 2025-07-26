import bcrypt from 'bcryptjs' // PAssword hashing library
import jwt from 'jsonwebtoken' // Generating JWT tokens
import User from '../models/User.js' // User model
import OTP from '../models/OTP.js' // OTP model
import generateOTP from '../utils/generateOTP.js' // Generate OTP
import sendEmail from '../utils/sendEmail.js' // Or use sendSMS
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '../utils/tokenUtils.js' // Token utilities
import AppError from '../utils/AppError.js' // Custom error class
import { blacklistToken } from '../utils/tokenBlacklist.js';
import { authLogger } from '../utils/Logger.js';
import { validatePasswordStrength } from '../utils/passwordPolicy.js';
import { handleLoginAttempt, checkAccountLock } from '../utils/accountSecurity.js';

import dotenv from 'dotenv' //Loads env variables (JWT_SECRET)
 
dotenv.config() //Initialize env variables 

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Log failed registration attempt
      authLogger.register(null, email, false, ip, userAgent, {
        reason: 'Email already exists'
      });
      
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.success) {
      // Log failed registration attempt
      authLogger.register(null, email, false, ip, userAgent, {
        reason: 'Weak password',
        details: passwordValidation.message
      });
      
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Hash password with higher cost factor for production
    const salt = await bcrypt.genSalt(process.env.NODE_ENV === 'production' ? 12 : 10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get client info for token metadata
    const deviceId = req.headers['x-device-id'] || 'unknown';

    // Create user with refresh token in one operation
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      phone: phone || '',
      lastLogin: new Date(),
      loginCount: 1,
      activityLogs: [{
        action: 'register',
        details: 'User registered',
        ipAddress: ip,
        userAgent: userAgent
      }]
    });

    // Generate tokens with metadata
    const token = generateAccessToken(newUser._id, newUser.role, { ip, userAgent });
    const refreshToken = generateRefreshToken(newUser._id, { ip, userAgent, deviceId });
    
    // Store refresh token in user document
    newUser.refreshToken = refreshToken;
    
    // Save user with all data in one operation
    await newUser.save();
    
    // Log successful registration
    authLogger.register(newUser._id, email, true, ip, userAgent, {
      role: newUser.role
    });
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
      path: '/api/auth/refresh'
    });
    // Respond with user data + tokens (exclude sensitive data)
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
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    
    // Log error
    authLogger.register(null, req.body.email, false, 
      req.ip || req.connection.remoteAddress, 
      req.headers['user-agent'], {
        error: err.message
      }
    );
    
    res.status(500).json({ 
      message: 'Registration failed. Please try again.' 
    });
  }
};

// @desc    Login user/laborer/admin
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // find user by email
    const user = await User.findOne({ email })
    if (!user) {
      // Log failed login attempt for non-existent user
      authLogger.login(null, email, false, ip, userAgent, {
        reason: 'User not found'
      });
      
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if account is locked
    const lockStatus = checkAccountLock(user);
    if (lockStatus.isLocked) {
      // Log failed login attempt due to account lock
      authLogger.login(user._id, email, false, ip, userAgent, {
        reason: 'Account locked',
        lockUntil: lockStatus.lockUntil
      });
      
      return res.status(403).json({ 
        message: `Account temporarily locked. Try again in ${lockStatus.timeLeft} minutes.` 
      });
    }

    // Compare passwords
    // Uses bcrypt.compare to match hashed passwords
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      // Handle failed login attempt
      const attemptResult = await handleLoginAttempt(user, false);
      
      // Log failed login attempt
      authLogger.login(user._id, email, false, ip, userAgent, {
        reason: 'Invalid password',
        attempts: user.loginAttempts,
        isLocked: attemptResult.isLocked
      });
      
      // If account is now locked, return lock message
      if (attemptResult.isLocked) {
        const timeLeft = Math.ceil((attemptResult.lockUntil - new Date()) / (60 * 1000));
        return res.status(403).json({ 
          message: `Too many failed attempts. Account locked for ${timeLeft} minutes.` 
        });
      }
      
      return res.status(401).json({ 
        message: 'Invalid email or password',
        attemptsRemaining: attemptResult.attemptsRemaining
      });
    }
    
    // Handle successful login attempt
    await handleLoginAttempt(user, true);
    // Get client info for token metadata
    const deviceId = req.headers['x-device-id'] || 'unknown';

    // Generate tokens
    const token = generateAccessToken(user._id, user.role, { ip, userAgent });
    const refreshToken = generateRefreshToken(user._id, { ip, userAgent, deviceId });
    
    // Store refresh token in user document
    user.refreshToken = refreshToken;
     user.lastLogin = new Date()
    user.loginCount += 1
    user.activityLogs.push({
      action: 'login',
      details: 'User logged in',
      ipAddress: ip,
      userAgent: userAgent
    })

    await user.save();

    // Log successful login
    authLogger.login(user._id, email, true, ip, userAgent);
    
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days in milliseconds
      path: '/api/auth/refresh' // Restrict to refresh endpoint
    });
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
    console.error('Login error:', err.message);
    
    // Log failed login attempt
    authLogger.login(null, req.body.email, false, 
      req.ip || req.connection.remoteAddress, 
      req.headers['user-agent'], {
        error: err.message
      }
    );
    
    // Single error response
    res.status(500).json({ 
      message: 'Login failed. Please try again.' 
    });
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

    // Check if account is active
    if (!user.isActive || user.status !== 'active') {
      // Use generic error message to prevent user enumeration
      return res.status(404).json({ message: 'If this account exists, an OTP has been sent.' })
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
        if (process.env.NODE_ENV === 'development' && emailResult && emailResult.previewUrl) {
          responseData.previewUrl = emailResult.previewUrl;
          // Email sent successfully
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
    
    // Get client info for token metadata
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    const deviceId = req.headers['x-device-id'] || 'unknown'

    // Generate JWT token and return user data
    const token = generateAccessToken(user._id, user.role, { ip, userAgent })
    const refreshToken = generateRefreshToken(user._id, { ip, userAgent, deviceId })
    
    // Update user login information
    user.refreshToken = refreshToken
    user.lastLogin = new Date()
    user.loginCount += 1
    user.activityLogs.push({
      action: 'otp_login',
      details: `User logged in via OTP (${email ? 'email' : 'phone'})`,
      ipAddress: ip,
      userAgent: userAgent
    })

    await user.save()

     // Log successful OTP verification
    console.log(`✅ User logged in via OTP: ${email || phone} (${user._id})`)
    
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
    // Get refresh token from cookies
    const requestToken = req.cookies.refreshToken;
    
    if (!requestToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(requestToken, process.env.JWT_SECRET);
    
    // Find user with this refresh token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== requestToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
      
    // Check if account is active
    if (!user.isActive || user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive or suspended' });
    }
      
    // Get client info for token metadata
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    const deviceId = req.headers['x-device-id'] || decoded.metadata?.deviceId || 'unknown'
    
    // Generate new tokens
    const newToken = generateToken(user._id, user.role, { ip, userAgent });
    const newRefreshToken = generateRefreshToken(user._id, { ip, userAgent, deviceId });
    
    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    user.activityLogs.push({
        action: 'token_refresh',
        details: 'User refreshed authentication token',
        ipAddress: ip,
        userAgent: userAgent
    });
    await user.save();

    // Log token refresh
    console.log(`✅ Token refreshed for user: ${user.email} (${user._id})`)
    
     // When sending the response, set the new refresh token as a cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
      path: '/api/auth/refresh'
    });

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
    res.status(500).json({ message: 'Failed to refresh token. Please login again.' });
  } 
};

// @desc    Logout user (invalidate refresh token)
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get client info for logging
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    
    
    /// Find user and update
    const user = await User.findById(userId);
    if (user && user.refreshToken) {
      // Add to token blacklist if implementing that feature
      await blacklistToken(user.refreshToken, userId, {
        type: 'refresh',
        reason: 'logout'
      });
      
      // Clear refresh token from user document
      user.refreshToken = null;
      user.activityLogs.push({
        action: 'logout',
        details: 'User logged out',
        ipAddress: ip,
        userAgent: userAgent
      });
      
      await user.save();
      // Log logout
       // Log logout
      authLogger.logout(user._id, user.email, ip, userAgent);

      console.log(`✅ User logged out: ${user.email} (${user._id})`)
    } 
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      path: '/api/auth/refresh'
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed. Please try again.' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
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
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to retrieve user information' });
  }
};