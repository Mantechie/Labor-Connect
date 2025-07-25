import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add admin name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Profile picture
  profilePicture: {
    type: String,
    default: null
  },
  
  // Admin-specific fields
  adminId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'ADM' + Date.now().toString().slice(-6);
    }
  },
  
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  
  department: {
    type: String,
    default: 'general',
    enum: ['general', 'support', 'operations', 'finance', 'marketing']
  },
  
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_laborers', 
      'manage_jobs',
      'manage_reviews',
      'manage_documents',
      'manage_reports',
      'manage_notifications',
      'view_analytics',
      'system_settings',
      'manage_admins'
    ]
  }],
  
  // Collaboration and status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isCollaborator: {
    type: Boolean,
    default: false
  },
  
  collaborationLimit: {
    type: Number,
    default: 2,
    min: 1,
    max: 2
  },
  
  // Token management
  currentToken: {
    type: String,
    default: null
  },
  
  refreshToken: {
    type: String,
    default: null
  },
  
  tokenExpiry: {
    type: Date,
    default: null
  },
  
  // OTP fields
  otpCode: {
    type: String,
    default: null
  },
  
  otpExpiry: {
    type: Date,
    default: null
  },
  
  otpVerified: {
    type: Boolean,
    default: false
  },

  otpPurpose: {
    type: String,
    enum: ['profile_update', 'password_change', null],
    default: null
  },

  pendingChanges: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Login tracking
  lastLogin: {
    type: Date,
    default: null
  },
  
  loginCount: {
    type: Number,
    default: 0
  },
  
  // Session management
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  
  lastActivity: {
    type: Date,
    default: null
  },
  
  // Activity tracking
  actions: [{
    action: {
      type: String,
      required: true
    },
    target: {
      type: String,
      default: null
    },
    details: {
      type: String,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Security
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date,
    default: null
  },
  
  // Add to Admin model schema
  passwordHistory: {
    type: [String],
    default: [],
    select: false
  },

  passwordChangedAt: {
    type: Date,
    default: Date.now
  },

  // Two-factor authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better performance
adminSchema.index({ isActive: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ currentToken: 1 });
adminSchema.index({ isLoggedIn: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
adminSchema.methods.updateLoginStats = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  this.isLoggedIn = true;
  this.lastActivity = new Date();
  return this.save();
};

adminSchema.methods.logAction = function(action, target, details) {
  this.actions.push({
    action,
    target,
    details,
    timestamp: new Date()
  });
  
  // Keep only last 100 actions
  if (this.actions.length > 100) {
    this.actions = this.actions.slice(-100);
  }
  
  return this.save();
};

adminSchema.methods.incrementFailedLogin = function() {
  this.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  return this.save();
};

adminSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > new Date();
};

// Token management methods
adminSchema.methods.setToken = function(token, expiryMinutes = 30) {
  this.currentToken = token;
  this.tokenExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
  this.isLoggedIn = true;
  this.lastActivity = new Date();
  return this.save();
};

adminSchema.methods.clearToken = function() {
  this.currentToken = null;
  this.tokenExpiry = null;
  this.isLoggedIn = false;
  return this.save();
};

adminSchema.methods.isTokenValid = function(token) {
  return this.currentToken === token && 
         this.tokenExpiry && 
         this.tokenExpiry > new Date() &&
         this.isLoggedIn;
};

// OTP management methods
adminSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpCode = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.otpVerified = false;
  return this.save();
};

adminSchema.methods.verifyOTP = function(otp) {
  if (!this.otpCode || !this.otpExpiry) {
    return false;
  }
  
  if (this.otpExpiry < new Date()) {
    this.clearOTP();
    return false;
  }
  
  if (this.otpCode === otp) {
    this.otpVerified = true;
    this.save();
    return true;
  }
  
  return false;
};

adminSchema.methods.clearOTP = function() {
  this.otpCode = null;
  this.otpExpiry = null;
  this.otpVerified = false;
  return this.save();
};

adminSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Static methods
adminSchema.statics.getActiveCollaborators = function() {
  return this.find({ 
    isActive: true, 
    isCollaborator: true 
  }).select('-password -refreshToken -otpCode -twoFactorSecret');
};

adminSchema.statics.getCollaborationCount = function() {
  return this.countDocuments({ 
    isActive: true, 
    isCollaborator: true 
  });
};

adminSchema.statics.canAddCollaborator = async function() {
  const count = await this.getCollaborationCount();
  return count < 2; // Maximum 2 collaborators
};

adminSchema.statics.getLoggedInAdmins = function() {
  return this.find({ 
    isLoggedIn: true,
    isActive: true 
  }).select('name email role lastActivity');
};

adminSchema.statics.forceLogoutAll = async function() {
  return this.updateMany(
    { isLoggedIn: true },
    { 
      isLoggedIn: false,
      currentToken: null,
      tokenExpiry: null
    }
  );
};

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return this.name;
});

// Ensure virtual fields are serialized
adminSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.otpCode;
    delete ret.twoFactorSecret;
    return ret;
  }
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
