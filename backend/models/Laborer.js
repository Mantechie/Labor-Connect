import mongoose from 'mongoose'

const laborerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
      enum: ['plumber', 'electrician', 'mason', 'carpenter', 'painter', 'welder', 'other'],
    },
    experience: {
      type: Number,
      default: 0, // years of experience
    },
    
    // Document management
    documents: [
      {
        type: String, // URLs to KYC / ID / qualification docs
      },
    ],
    documentDetails: {
      aadhar: String,
      idProof: String,
      workLicense: String,
      otherDocs: [String]
    },
    documentStatus: {
      aadhar: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      idProof: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      workLicense: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    },

    // Portfolio management
    photos: [
      {
        type: String, // Work portfolio images
      },
    ],
    videos: [
      {
        type: String, // Optional portfolio videos
      },
    ],
    portfolio: [{
      title: {
        type: String,
        required: true,
        maxlength: [100, 'Portfolio title cannot exceed 100 characters']
      },
      description: {
        type: String,
        required: true,
        maxlength: [500, 'Portfolio description cannot exceed 500 characters']
      },
      category: {
        type: String,
        required: true,
        enum: ['plumbing', 'electrical', 'carpentry', 'painting', 'masonry', 'welding', 'other']
      },
      imageUrl: {
        type: String,
        required: true
      },
      isApproved: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],

    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
    },

    // Availability and Status
    availability: {
      type: String,
      enum: ['online', 'busy', 'offline'],
      default: 'offline'
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'blocked'],
      default: 'active'
    },
    statusReason: {
      type: String,
      default: null
    },

    // Verification and Approval
    isApproved: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    verificationNotes: {
      type: String,
      default: null
    },
    approvalDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },

    // Rating and Reviews
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    numReviews: {
      type: Number,
      default: 0,
    },

    // Complaints Management
    complaintsReceived: [{
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      reason: {
        type: String,
        required: true
      },
      details: {
        type: String,
        required: true
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved', 'dismissed'],
        default: 'pending'
      },
      adminNotes: {
        type: String,
        default: null
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      resolvedAt: {
        type: Date,
        default: null
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
      }
    }],

    // Work History and Performance
    totalJobsCompleted: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    averageJobRating: {
      type: Number,
      default: 0
    },
    lastJobDate: Date,

    // Account Management
    warnings: [{
      reason: {
        type: String,
        required: true
      },
      details: {
        type: String,
        required: true
      },
      issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
      },
      issuedAt: {
        type: Date,
        default: Date.now
      }
    }],
    suspensions: [{
      reason: {
        type: String,
        required: true
      },
      startDate: {
        type: Date,
        default: Date.now
      },
      endDate: Date,
      issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],

    // Activity Tracking
    lastActive: {
      type: Date,
      default: Date.now
    },
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    },

    // Location (if using geolocation)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      address: String,
      city: String,
      state: String,
      pincode: String
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true,
  }
)

// Add index for geospatial queries
laborerSchema.index({ location: '2dsphere' });

// Methods
laborerSchema.methods.updateRating = function() {
  // This would be called when reviews are updated
  // Implementation depends on your Review model structure
};

laborerSchema.methods.addComplaint = function(complainantId, reason, details, severity = 'medium') {
  this.complaintsReceived.push({
    from: complainantId,
    reason,
    details,
    severity,
    createdAt: new Date()
  });
  return this.save();
};

laborerSchema.methods.addWarning = function(adminId, reason, details) {
  this.warnings.push({
    reason,
    details,
    issuedBy: adminId,
    issuedAt: new Date()
  });
  return this.save();
};

laborerSchema.methods.suspend = function(adminId, reason, endDate) {
  // End any active suspensions
  this.suspensions.forEach(suspension => {
    if (suspension.isActive) {
      suspension.isActive = false;
    }
  });

  // Add new suspension
  this.suspensions.push({
    reason,
    endDate,
    issuedBy: adminId,
    isActive: true
  });

  this.status = 'suspended';
  return this.save();
};

laborerSchema.methods.unsuspend = function() {
  this.suspensions.forEach(suspension => {
    if (suspension.isActive) {
      suspension.isActive = false;
    }
  });
  this.status = 'active';
  return this.save();
};

laborerSchema.methods.getComplaintsSummary = function() {
  const complaints = this.complaintsReceived;
  return {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    critical: complaints.filter(c => c.severity === 'critical').length,
    high: complaints.filter(c => c.severity === 'high').length
  };
};

// Virtual for complaint flag
laborerSchema.virtual('hasComplaints').get(function() {
  return this.complaintsReceived && this.complaintsReceived.length > 0;
});

// Virtual for active suspension
laborerSchema.virtual('isCurrentlySuspended').get(function() {
  return this.suspensions.some(suspension => 
    suspension.isActive && 
    (!suspension.endDate || suspension.endDate > new Date())
  );
});

const Laborer = mongoose.model('Laborer', laborerSchema)
export default Laborer
