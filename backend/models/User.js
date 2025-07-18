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
    phone: {
      type: String,
      required: true,
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
    documents: [
      {
        type: String, // URL to uploaded document
      },
    ],
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

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    otp: {
      code: String,
      expiresAt: Date,
    },

    media: {
      type: [String],
      default: [],
     },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', userSchema)
export default User
