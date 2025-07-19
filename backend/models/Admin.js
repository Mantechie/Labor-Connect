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
      'system_settings'
    ]
  }],
  
  department: {
    type: String,
    enum: ['general', 'support', 'verification', 'moderation', 'analytics'],
    default: 'general'
  },
  
  profilePhoto: {
    type: String,
    default: null
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  
  // Admin activity tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  loginCount: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Admin actions tracking
  actionsPerformed: [{
    action: {
      type: String,
      required: true
    },
    target: {
      type: String,
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },
    details: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // OTP fields for admin login
  otp: {
    code: String,
    expiresAt: Date,
  },
  
  // Refresh token for admin sessions
  refreshToken: {
    type: String,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
adminSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Encrypt password using bcrypt
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match admin entered password to hashed password in database
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last login and increment login count
adminSchema.methods.updateLoginStats = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
};

// Log admin action
adminSchema.methods.logAction = function(action, target, targetId, details) {
  this.actionsPerformed.push({
    action,
    target,
    targetId,
    details,
    timestamp: new Date()
  });
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
