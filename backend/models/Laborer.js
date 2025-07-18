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
    documents: [
      {
        type: String, // URLs to KYC / ID / qualification docs
      },
    ],
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
  },
  {
    timestamps: true,
  }
)

const Laborer = mongoose.model('Laborer', laborerSchema)
export default Laborer
