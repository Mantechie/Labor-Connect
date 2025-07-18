import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    otpCode: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms'],
      default: 'sms',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // auto-delete after 10 minutes (600 seconds)
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const OTP = mongoose.model('OTP', otpSchema)
export default OTP
