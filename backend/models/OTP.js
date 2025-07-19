import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
    },
    otpCode: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms'],
      default: 'email',
    },
    expiresAt: {
      type: Date,
      required: true,
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
