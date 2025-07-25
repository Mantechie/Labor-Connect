import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordHistory: {
      type: [String],
      default: [],
      select: false // Don't include in normal queries
    },
    passwordLastChanged: {
      type: Date,
      default: Date.now
    },
    phone: {
      type: String,
      required: false, // Make phone optional for now
    },
    address: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'laborer'],
      default: 'user',
    },

    // Laborer specific fields (if applicable)
    specialization: {
      type: String,
    },
    skills: [{
      type: String,
      trim: true
    }],
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative']
    },
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative']
    },
    dailyRate: {
      type: Number,
      min: [0, 'Daily rate cannot be negative']
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: Date,

    // Documents for verification
    documents: [
      {
        type: String, // URL to uploaded document
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

    // Portfolio for laborers
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
        enum: ['plumbing', 'electrical', 'carpentry', 'painting', 'masonry', 'other']
      },
      imageUrl: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],

    photos: [
      {
        type: String, // URLs of uploaded work/media
      },
    ],
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
    },

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

    // Reviews system
    reviews: [{
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        required: true,
        maxlength: [500, 'Review comment cannot exceed 500 characters']
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],

    // Earnings tracking
    totalEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Total earnings cannot be negative']
    },
    completedJobs: {
      type: Number,
      default: 0,
      min: [0, 'Completed jobs cannot be negative']
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true
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
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    blockedAt: {
      type: Date,
      default: null
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    lastLogin: {
      type: Date,
      default: null
    },
    loginCount: {
      type: Number,
      default: 0
    },

    // Activity tracking
    activityLogs: [{
      action: {
        type: String,
        required: true
      },
      details: {
        type: String,
        default: null
      },
      ipAddress: {
        type: String,
        default: null
      },
      userAgent: {
        type: String,
        default: null
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],

    // Admin actions tracking
    adminActions: [{
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
      },
      action: {
        type: String,
        required: true
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

    // Verification and documents
    isVerified: {
      type: Boolean,
      default: false
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

    // Complaints and reports
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
      }
    }],

    complaintsFiled: [{
      against: {
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
      status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved', 'dismissed'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],

    // Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },

    otp: {
      code: String,
      expiresAt: Date,
    },

    // Refresh token for JWT refresh mechanism
    refreshToken: {
      type: String,
      default: null
    },

    media: {
      type: [String],
      default: [],
     },
    profilePhoto: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Calculate average rating when reviews are added
userSchema.methods.updateRating = function() {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRating / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

// Add review to laborer
userSchema.methods.addReview = function(reviewerId, rating, comment) {
  // Check if user has already reviewed this laborer
  const existingReview = this.reviews.find(
    review => review.reviewer.toString() === reviewerId
  );

  if (existingReview) {
    throw new Error('You have already reviewed this laborer');
  }

  // Add new review
  this.reviews.push({
    reviewer: reviewerId,
    rating,
    comment,
    date: new Date()
  });

  // Update rating
  this.updateRating();
};

const User = mongoose.model('User', userSchema)
export default User
