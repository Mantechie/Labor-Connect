import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'PROFILE_UPDATE',
      'PASSWORD_CHANGE',
      'OTP_GENERATE',
      'OTP_VERIFY',
      'ADMIN_CREATE',
      'ADMIN_UPDATE',
      'ADMIN_DELETE',
      'SYSTEM_CONFIG',
      'SECURITY_EVENT',
      'FORCE_LOGOUT',
      'FAILED_LOGIN_ATTEMPT',
      'ACCOUNT_LOCKED',
      'SESSION_EXPIRED',
      'PROFILE_PICTURE_UPDATE',
      'COLLABORATOR_ADDED',
      'COLLABORATOR_REMOVED',
      'NOTIFICATION_SENT',
      'AUDIT_LOG_VIEWED',
      'AUDIT_LOG_EXPORT'
    ]
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING', 'CANCELLED'],
    default: 'SUCCESS'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
adminLogSchema.index({ adminId: 1, timestamp: -1 });
adminLogSchema.index({ action: 1, timestamp: -1 });
adminLogSchema.index({ severity: 1, timestamp: -1 });
adminLogSchema.index({ status: 1, timestamp: -1 });
adminLogSchema.index({ createdAt: -1 }); // For date range queries
adminLogSchema.index({ adminId: 1, action: 1, timestamp: -1 }); // For combined querie

// Static method to create logs
adminLogSchema.statics.createLog = async function(logData) {
  try {
    const log = new this({
      adminId: logData.adminId,
      action: logData.action,
      description: logData.details,
      severity: logData.severity || 'LOW',
      status: logData.status || 'SUCCESS',
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      metadata: logData.metadata || {}
    });

    
    return await log.save();
  } catch (error) {
    console.error('Error creating admin log:', error);
    throw error;
  }
};

// Static method to get logs with pagination
adminLogSchema.statics.getLogs = async function(filters = {}, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    this.find(filters)
      .populate('adminId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(filters)
  ]);
  
  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

// Static method to get recent activity
adminLogSchema.statics.getRecentActivity = async function(limit = 10) {
  return this.find()
    .populate('adminId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get security events
adminLogSchema.statics.getSecurityEvents = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    createdAt: { $gte: startDate },
    $or: [
      { severity: { $in: ['HIGH', 'CRITICAL'] } },
      { action: { $in: [
        'FAILED_LOGIN_ATTEMPT',
        'ACCOUNT_LOCKED',
        'FORCE_LOGOUT',
        'SECURITY_EVENT'
      ] } }
    ]
  })
  .populate('adminId', 'name email role')
  .sort({ createdAt: -1 });
};

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

export default AdminLog; 