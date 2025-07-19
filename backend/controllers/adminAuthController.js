import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import OTP from '../models/OTP.js';
import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';

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

    console.log('🔍 Admin details:', {
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
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Update login stats
    admin.updateLoginStats();

    // Generate tokens
    const token = generateAdminToken(admin._id, admin.role);
    const refreshToken = generateAdminRefreshToken(admin._id);

    console.log('🔑 Generated tokens:', {
      tokenLength: token.length,
      refreshTokenLength: refreshToken.length,
      tokenStart: token.substring(0, 20) + '...',
      refreshTokenStart: refreshToken.substring(0, 20) + '...'
    });

    // Store refresh token
    admin.refreshToken = refreshToken;
    await admin.save();

    // Log the login action
    admin.logAction('login', 'system', null, 'Admin logged in successfully');

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
// @route   POST /api/admin-auth/logout
// @access  Private
export const adminLogout = async (req, res) => {
  try {
    const adminId = req.user.id;

    // Clear refresh token from admin document
    await Admin.findByIdAndUpdate(adminId, { refreshToken: null });

    res.json({ message: 'Admin logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current admin
// @route   GET /api/admin-auth/me
// @access  Private
export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ admin });
  } catch (error) {
    console.error('Get current admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 