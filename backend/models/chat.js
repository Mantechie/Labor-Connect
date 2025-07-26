import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid';

const chatSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    media: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Add indexes for query performance
chatSchema.index({ sender: 1, receiver: 1 });
chatSchema.index({ sender: 1, isRead: 1 });
chatSchema.index({ receiver: 1, isRead: 1 });
chatSchema.index({ createdAt: -1 });
chatSchema.index({ isDeleted: 1 });


export default mongoose.model('Chat', chatSchema)
