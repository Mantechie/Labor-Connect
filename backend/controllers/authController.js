import crypto from 'crypto'
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
    
    // Generate CSRF token
    const csrfToken = crypto.randomBytes(20).toString('hex');

    // Store refresh token in user document
    newUser.refreshToken = refreshToken;
    
    // Save user with all data in one operation
    await newUser.save();
    
    // Log successful registration
    authLogger.register(newUser._id, email, true, ip, userAgent, {
      role: newUser.role
    });

    // Set access token as HTTP-only cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh'
    });

    // Set CSRF token as a regular cookie (accessible to JavaScript)
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
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
      },
      csrfToken: csrfToken
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
    
    // Generate CSRF token
    const csrfToken = crypto.randomBytes(20).toString('hex');


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

    // Set access token as HTTP-only cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/api/auth/refresh' // Restrict to refresh endpoint
    });

    // Set CSRF token as a regular cookie (accessible to JavaScript)
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
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
      },
      csrfToken: csrfToken
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

    // Generate tokens
    const token = generateAccessToken(user._id, user.role, { ip, userAgent });
    const refreshToken = generateRefreshToken(user._id, { ip, userAgent, deviceId });
    
    
    // Generate CSRF token
    const csrfToken = crypto.randomBytes(20).toString('hex');
    
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
    
    // Set access token as HTTP-only cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh'
    });
    
    // Set CSRF token as a regular cookie
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    res.status(200).json({
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      csrfToken: csrfToken // Include CSRF token in response
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
    // Get refresh token from cookie
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }
    
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if refresh token matches stored token
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const deviceId = req.headers['x-device-id'] || 'unknown';
    
    const newAccessToken = generateAccessToken(user._id, user.role, { ip, userAgent });
    const newRefreshToken = generateRefreshToken(user._id, { ip, userAgent, deviceId });
    
    // Generate new CSRF token
    const csrfToken = crypto.randomBytes(20).toString('hex');
    
    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();
    
    // Set new access token as HTTP-only cookie
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    // Set new refresh token as HTTP-only cookie
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh'
    });
    
    // Set new CSRF token as a regular cookie
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    // Return success response with new CSRF token
    res.status(200).json({
      message: 'Token refreshed successfully',
      csrfToken: csrfToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// @desc    Logout user (invalidate refresh token)
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refresh_token;
    
    if (refreshToken) {
      // Blacklist the refresh token
      blacklistToken(refreshToken);
      
      // Find user by refresh token and update
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    
    // Clear all cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    res.clearCookie('csrf_token', { path: '/' });
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed. Please try again.' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
// @desc    Reset user password with OTP verification
// @route   POST /api/auth/reset-password
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Validate input
    if (!name && !phone) {
      return res.status(400).json({ message: 'At least one field (name or phone) is required' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Log activity
    user.activityLogs.push({
      action: 'update_profile',
      details: 'User updated profile',
      ipAddress: ip,
      userAgent: userAgent
    });

    await user.save();

    // Log successful update
    authLogger.updateProfile(user._id, user.email, true, ip, userAgent);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Log error
    authLogger.updateProfile(req.user?.id, req.user?.email, false, 
      req.ip || req.connection.remoteAddress, 
      req.headers['user-agent'], {
        error: error.message
      }
    );
    
    res.status(500).json({ message: 'Profile update failed. Please try again.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Validate required fields
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otpCode: otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteMany({ email });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.success) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(process.env.NODE_ENV === 'production' ? 12 : 10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    user.activityLogs.push({
      action: 'password_reset',
      details: 'Password reset via OTP',
      ipAddress: ip,
      userAgent: userAgent
    });

    // Mark OTP as used and delete
    otpRecord.isUsed = true;
    await Promise.all([
      user.save(),
      otpRecord.save(),
      OTP.deleteMany({ email })
    ]);

    // Log successful password reset
    authLogger.passwordReset(user._id, email, true, ip, userAgent);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    
    // Log failed password reset attempt
    authLogger.passwordReset(null, req.body.email, false, 
      req.ip || req.connection.remoteAddress, 
      req.headers['user-agent'], {
        error: error.message
      }
    );
    
    res.status(500).json({ message: 'Password reset failed. Please try again.' });
  }
};

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

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.success) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};