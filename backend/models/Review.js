import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    laborer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // or 'Laborer' if using a separate model
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    photos: [
      {
        type: String, // optional review photos (URLs)
      },
    ],
    isVerified: {
      type: Boolean,
      default: false, // verified by admin
    },
  },
  {
    timestamps: true,
  }
)

const Review = mongoose.model('Review', reviewSchema)
export default Review
