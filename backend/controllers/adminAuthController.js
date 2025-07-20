import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import OTP from '../models/OTP.js';
import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';
import AdminLog from '../models/AdminLog.js';
import sendSMS from '../utils/sendSMS.js'; // Added sendSMS import

dotenv.config();

// Generate JWT for admin
const generateAdminToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate refresh token for admin
const generateAdminRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '60d',
  });
};

// @desc    Register new admin (super admin only)
// @route   POST /api/admin-auth/register
// @access  Super Admin only
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, role, department, permissions } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Check if phone already exists
    const existingPhone = await Admin.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Create admin
    const newAdmin = new Admin({
      name,
      email,
      password,
      phone,
      role: role || 'admin',
      department: department || 'general',
      permissions: permissions || ['manage_users', 'manage_laborers', 'view_analytics']
    });

    await newAdmin.save();

    // Generate tokens
    const token = generateAdminToken(newAdmin._id, newAdmin.role);
    const refreshToken = generateAdminRefreshToken(newAdmin._id);

    // Store refresh token
    newAdmin.refreshToken = refreshToken;
    await newAdmin.save();

    res.status(201).json({
      message: 'Admin registration successful',
      admin: {
        id: newAdmin._id,
        adminId: newAdmin.adminId,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
        department: newAdmin.department,
        permissions: newAdmin.permissions,
        token: token,
        refreshToken: refreshToken,
      },
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    console.log('🔍 Admin login attempt:', { 
      email: req.body.email,
      hasPassword: !!req.body.password,
      bodyKeys: Object.keys(req.body)
    });
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email }).select('+password');
    console.log('🔍 Admin found:', admin ? 'Yes' : 'No');
    
    if (!admin) {
      console.log('❌ Admin not found for email:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      console.log('❌ Admin account is deactivated');
      return res.status(400).json({ message: 'Admin account is deactivated' });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      console.log('❌ Admin account is locked');
      return res.status(400).json({ message: 'Account is temporarily locked due to multiple failed attempts' });
    }

    console.log('�� Admin details:', {
      id: admin._id,
      adminId: admin.adminId,
      email: admin.email,
      hasPassword: !!admin.password,
      passwordLength: admin.password ? admin.password.length : 0,
      isActive: admin.isActive,
      role: admin.role
    });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('🔐 Password match:', isMatch);
    console.log('🔐 Input password:', password);
    console.log('🔐 Stored password hash:', admin.password ? admin.password.substring(0, 20) + '...' : 'null');
    
    if (!isMatch) {
      console.log('❌ Password does not match');
      
      // Increment failed login attempts
      await admin.incrementFailedLogin();
      
      // Log failed login attempt
      await AdminLog.createLog({
        adminId: admin._id,
        action: 'FAILED_LOGIN_ATTEMPT',
        details: 'Failed login attempt',
        severity: 'MEDIUM',
        status: 'FAILED',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if admin is already logged in
    if (admin.isLoggedIn && admin.currentToken) {
      console.log('⚠️ Admin already logged in, clearing previous session');
      await admin.clearToken();
    }

    // Update login stats
    await admin.updateLoginStats();

    // Generate tokens
    const token = generateAdminToken(admin._id, admin.role);
    const refreshToken = generateAdminRefreshToken(admin._id);

    console.log('🔑 Generated tokens:', {
      tokenLength: token.length,
      refreshTokenLength: refreshToken.length,
      tokenStart: token.substring(0, 20) + '...',
      refreshTokenStart: refreshToken.substring(0, 20) + '...'
    });

    // Store tokens in database
    await admin.setToken(token, 30); // 30 minutes expiry
    admin.refreshToken = refreshToken;
    await admin.save();

    // Log the login action
    await admin.logAction('login', 'system', 'Admin logged in successfully');
    
    // Log successful login
    await AdminLog.createLog({
      adminId: admin._id,
      action: 'LOGIN',
      details: 'Successful login',
      severity: 'LOW',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    console.log('✅ Admin login successful:', admin.email);

    const responseData = {
      message: 'Admin login successful',
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        department: admin.department,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
        loginCount: admin.loginCount,
        token: token,
        refreshToken: refreshToken,
      },
    };

    console.log('📤 Sending response with admin data:', {
      hasToken: !!responseData.admin.token,
      hasRefreshToken: !!responseData.admin.refreshToken,
      adminId: responseData.admin.adminId
    });

    res.status(200).json(responseData);
  } catch (err) {
    console.error('❌ Admin login error:', err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Send OTP to admin email/phone
// @route   POST /api/admin-auth/send-otp
// @access  Public
export const sendAdminOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    // Check if admin exists
    let admin;
    if (email) {
      admin = await Admin.findOne({ email });
    } else if (phone) {
      admin = await Admin.findOne({ phone });
    }

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (!admin.isActive) {
      return res.status(400).json({ message: 'Admin account is deactivated' });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    // Remove old OTPs for this admin
    if (email) {
      await OTP.deleteMany({ email });
    } else if (phone) {
      await OTP.deleteMany({ phone });
    }

    // Create new OTP
    const newOtp = new OTP({
      email: email || admin.email,
      phone: phone || admin.phone,
      otpCode,
      expiresAt,
      type: email ? 'email' : 'sms'
    });

    await newOtp.save();

    // Send OTP via Email
    if (email) {
      try {
        const emailResult = await sendEmail({
          to: email,
          subject: 'LabourConnect Admin - OTP Verification',
          text: `Your admin OTP is ${otpCode}. Valid for 10 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc3545;">🔐 Admin OTP Verification</h2>
              <p>Hello ${admin.name},</p>
              <p>Your OTP for LabourConnect admin login is:</p>
              <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #dc3545;">
                <h1 style="color: #dc3545; font-size: 32px; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
              </div>
              <p><strong>Valid for 10 minutes</strong></p>
              <p>If you didn't request this OTP, please contact the system administrator immediately.</p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">LabourConnect Admin Panel - Secure Access</p>
            </div>
          `
        });

        const responseData = {
          message: 'Admin OTP sent to your email',
          email: email,
          expiresIn: '10 minutes'
        };

        if (emailResult && emailResult.previewUrl) {
          responseData.previewUrl = emailResult.previewUrl;
          console.log(`🔗 Admin Email Preview URL: ${emailResult.previewUrl}`);
        }

        res.status(200).json(responseData);
      } catch (emailError) {
        console.error('Admin email sending failed:', emailError);
        res.status(500).json({ message: 'Failed to send admin OTP email. Please try again.' });
      }
    } else {
      // For SMS, you would implement SMS sending here
      res.status(200).json({
        message: 'Admin OTP sent to your phone',
        phone: phone,
        expiresIn: '10 minutes'
      });
    }
  } catch (error) {
    console.error('Send admin OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// @desc    Verify admin OTP
// @route   POST /api/admin-auth/verify-otp
// @access  Public
export const verifyAdminOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // Find OTP
    let otpRecord;
    if (email) {
      otpRecord = await OTP.findOne({ email, otpCode: otp });
    } else if (phone) {
      otpRecord = await OTP.findOne({ phone, otpCode: otp });
    }

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Find admin
    let admin;
    if (email) {
      admin = await Admin.findOne({ email });
    } else if (phone) {
      admin = await Admin.findOne({ phone });
    }

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (!admin.isActive) {
      return res.status(400).json({ message: 'Admin account is deactivated' });
    }

    // Update login stats
    admin.updateLoginStats();

    // Generate tokens
    const token = generateAdminToken(admin._id, admin.role);
    const refreshToken = generateAdminRefreshToken(admin._id);

    // Store refresh token
    admin.refreshToken = refreshToken;
    await admin.save();

    // Log the login action
    admin.logAction('login', 'system', null, 'Admin logged in via OTP');

    // Delete used OTP
    await OTP.findByIdAndDelete(otpRecord._id);

    res.status(200).json({
      message: 'Admin OTP verification successful',
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        department: admin.department,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
        loginCount: admin.loginCount,
        token: token,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    console.error('Verify admin OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// @desc    Refresh admin access token
// @route   POST /api/admin-auth/refresh
// @access  Public
export const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Find admin with this refresh token
    const admin = await Admin.findById(decoded.id);
    if (!admin || admin.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Admin account is deactivated' });
    }

    // Generate new tokens
    const newToken = generateAdminToken(admin._id, admin.role);
    const newRefreshToken = generateAdminRefreshToken(admin._id);

    // Update refresh token in database
    admin.refreshToken = newRefreshToken;
    await admin.save();

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        department: admin.department,
        permissions: admin.permissions,
      }
    });
  } catch (error) {
    console.error('Refresh admin token error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin logout
// @route   POST /api/admin/auth/logout
// @access  Admin only
export const adminLogout = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    
    if (admin) {
      // Clear tokens and session
      await admin.clearToken();
      
      // Log the logout action
      await AdminLog.createLog({
        adminId: admin._id,
        action: 'LOGOUT',
        details: 'Admin logged out successfully',
        severity: 'LOW',
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({ message: 'Admin logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Failed to logout' });
  }
};

// @desc    Get current admin
// @route   GET /api/admin/auth/me
// @access  Admin only
export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password -refreshToken');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      admin: admin
    });
  } catch (error) {
    console.error('Get current admin error:', error);
    res.status(500).json({ message: 'Failed to get admin data' });
  }
};

// Update admin profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, department, role } = req.body;
    const adminId = req.admin.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if any values have actually changed
    const hasChanges = (
      name !== admin.name ||
      email !== admin.email ||
      phone !== admin.phone ||
      department !== admin.department ||
      role !== admin.role
    );

    if (!hasChanges) {
      return res.status(200).json({ 
        message: 'No changes detected',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          department: admin.department,
          role: admin.role,
          profilePicture: admin.profilePicture,
          isActive: admin.isActive,
          isCollaborator: admin.isCollaborator,
          permissions: admin.permissions
        }
      });
    }

    // If changes detected, check if OTP is provided and verified
    const { otp } = req.body;
    
    if (!otp) {
      // Generate and send OTP for verification
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      admin.otpCode = otpCode;
      admin.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      admin.otpVerified = false;
      admin.otpPurpose = 'profile_update';
      admin.pendingChanges = { name, email, phone, department, role };
      await admin.save();

      // Send OTP via email and SMS
      try {
        await sendEmail({
          to: admin.email,
          subject: 'Admin Profile Update - OTP Verification',
          html: `
            <h2>🔐 Admin Profile Update Verification</h2>
            <p>You have requested to update your admin profile.</p>
            <p><strong>Your OTP Code: ${otpCode}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this change, please contact the system administrator.</p>
          `
        });

        await sendSMS({
          to: admin.phone,
          message: `Your admin profile update OTP is: ${otpCode}. Valid for 10 minutes.`
        });

        // Notify other admins
        await notifyAdmins({
          subject: 'Admin Profile Update Requested',
          message: `Admin ${admin.name} (${admin.email}) has requested to update their profile. OTP verification required.`,
          excludeAdminId: admin._id
        });

        // Log the action
        await AdminLog.createLog({
          adminId: admin._id,
          action: 'PROFILE_UPDATE',
          details: 'Profile update OTP generated',
          severity: 'MEDIUM',
          status: 'PENDING',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(200).json({
          message: 'OTP sent to your email and phone for verification',
          requiresOTP: true,
          otpSent: true
        });
      } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Failed to send OTP' });
      }
    }

    // Verify OTP
    if (!admin.otpCode || admin.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (admin.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified, apply changes
    admin.name = name;
    admin.email = email;
    admin.phone = phone;
    admin.department = department;
    admin.role = role;
    admin.otpCode = null;
    admin.otpExpiry = null;
    admin.otpVerified = false;
    admin.otpPurpose = null;
    admin.pendingChanges = null;
    await admin.save();

    // Notify other admins of successful update
    await notifyAdmins({
      subject: 'Admin Profile Updated',
      message: `Admin ${admin.name} (${admin.email}) has successfully updated their profile.`,
      excludeAdminId: admin._id
    });

    // Log the successful action
    await AdminLog.createLog({
      adminId: admin._id,
      action: 'PROFILE_UPDATE',
      details: 'Profile updated successfully',
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        department: admin.department,
        role: admin.role,
        profilePicture: admin.profilePicture,
        isActive: admin.isActive,
        isCollaborator: admin.isCollaborator,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Change admin password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, otp } = req.body;
    const adminId = req.admin.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is different
    const isNewPasswordDifferent = !(await bcrypt.compare(newPassword, admin.password));
    
    if (!isNewPasswordDifferent) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    // If no OTP provided, generate and send OTP
    if (!otp) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      admin.otpCode = otpCode;
      admin.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      admin.otpVerified = false;
      admin.otpPurpose = 'password_change';
      admin.pendingChanges = { newPassword };
      await admin.save();

      // Send OTP via email and SMS
      try {
        await sendEmail({
          to: admin.email,
          subject: 'Admin Password Change - OTP Verification',
          html: `
            <h2>🔐 Admin Password Change Verification</h2>
            <p>You have requested to change your admin password.</p>
            <p><strong>Your OTP Code: ${otpCode}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this change, please contact the system administrator immediately.</p>
          `
        });

        await sendSMS({
          to: admin.phone,
          message: `Your admin password change OTP is: ${otpCode}. Valid for 10 minutes.`
        });

        // Notify other admins
        await notifyAdmins({
          subject: 'Admin Password Change Requested',
          message: `Admin ${admin.name} (${admin.email}) has requested to change their password. OTP verification required.`,
          excludeAdminId: admin._id
        });

        // Log the action
        await AdminLog.createLog({
          adminId: admin._id,
          action: 'PASSWORD_CHANGE',
          details: 'Password change OTP generated',
          severity: 'HIGH',
          status: 'PENDING',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(200).json({
          message: 'OTP sent to your email and phone for verification',
          requiresOTP: true,
          otpSent: true
        });
      } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Failed to send OTP' });
      }
    }

    // Verify OTP
    if (!admin.otpCode || admin.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (admin.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified, change password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    admin.otpCode = null;
    admin.otpExpiry = null;
    admin.otpVerified = false;
    admin.otpPurpose = null;
    admin.pendingChanges = null;
    
    // Force logout all sessions
    admin.currentToken = null;
    admin.tokenExpiry = null;
    admin.isLoggedIn = false;
    await admin.save();

    // Notify other admins of password change
    await notifyAdmins({
      subject: 'Admin Password Changed',
      message: `Admin ${admin.name} (${admin.email}) has successfully changed their password. All sessions have been terminated.`,
      excludeAdminId: admin._id
    });

    // Log the successful action
    await AdminLog.createLog({
      adminId: admin._id,
      action: 'PASSWORD_CHANGE',
      details: 'Password changed successfully',
      severity: 'HIGH',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      message: 'Password changed successfully. Please login again.',
      logoutRequired: true
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// @desc    Upload admin profile picture
// @route   PUT /api/admin/auth/profile-picture
// @access  Admin only
export const uploadAdminProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Profile picture is required' });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only JPEG, PNG, and GIF images are allowed' });
    }
    
    // Validate file size (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size must be less than 5MB' });
    }
    
    const profilePicture = `/uploads/admin/${req.file.filename}`;
    
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin._id,
      { profilePicture },
      { new: true }
    ).select('-password -refreshToken');
    
    // Log the action
    updatedAdmin.logAction('profile_picture_update', 'self', 'Profile picture updated');
    
    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: updatedAdmin.profilePicture
    });
  } catch (error) {
    console.error('Upload admin profile picture error:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

// @desc    Get admin collaborators
// @route   GET /api/admin/auth/collaborators
// @access  Admin only
export const getAdminCollaborators = async (req, res) => {
  try {
    const collaborators = await Admin.getActiveCollaborators();
    
    res.json({
      admins: collaborators,
      total: collaborators.length,
      limit: 2
    });
  } catch (error) {
    console.error('Get admin collaborators error:', error);
    res.status(500).json({ message: 'Failed to get collaborators' });
  }
};

// @desc    Add admin collaborator (super admin only)
// @route   POST /api/admin/auth/collaborator
// @access  Super Admin only
export const addAdminCollaborator = async (req, res) => {
  try {
    // Check if current admin is super admin
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only super admin can add collaborators' });
    }
    
    // Check collaboration limit
    const canAdd = await Admin.canAddCollaborator();
    if (!canAdd) {
      return res.status(400).json({ message: 'Maximum 2 collaborators allowed' });
    }
    
    const { name, email, phone, password, department } = req.body;
    
    // Create new admin collaborator
    const newCollaborator = new Admin({
      name,
      email,
      phone,
      password,
      department: department || 'general',
      role: 'admin',
      isCollaborator: true,
      permissions: ['manage_users', 'manage_laborers', 'view_analytics']
    });
    
    await newCollaborator.save();
    
    // Log the action
    req.admin.logAction('add_collaborator', newCollaborator._id, `Added collaborator: ${newCollaborator.name}`);
    
    res.status(201).json({
      message: 'Collaborator added successfully',
      admin: {
        id: newCollaborator._id,
        name: newCollaborator.name,
        email: newCollaborator.email,
        role: newCollaborator.role,
        department: newCollaborator.department
      }
    });
  } catch (error) {
    console.error('Add admin collaborator error:', error);
    res.status(500).json({ message: 'Failed to add collaborator' });
  }
};

// @desc    Remove admin collaborator (super admin only)
// @route   DELETE /api/admin/auth/collaborator/:id
// @access  Super Admin only
export const removeAdminCollaborator = async (req, res) => {
  try {
    // Check if current admin is super admin
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only super admin can remove collaborators' });
    }
    
    const collaboratorId = req.params.id;
    
    // Prevent removing self
    if (collaboratorId === req.admin._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove yourself' });
    }
    
    const collaborator = await Admin.findById(collaboratorId);
    if (!collaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }
    
    if (!collaborator.isCollaborator) {
      return res.status(400).json({ message: 'User is not a collaborator' });
    }
    
    // Deactivate collaborator
    collaborator.isActive = false;
    collaborator.isCollaborator = false;
    await collaborator.save();
    
    // Log the action
    req.admin.logAction('remove_collaborator', collaboratorId, `Removed collaborator: ${collaborator.name}`);
    
    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Remove admin collaborator error:', error);
    res.status(500).json({ message: 'Failed to remove collaborator' });
  }
}; 