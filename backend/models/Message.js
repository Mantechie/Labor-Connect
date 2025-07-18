import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
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
    content: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        type: String, // optional image/video/file URLs
      },
    ],
    isSeen: {
      type: Boolean,
      default: false,
    },
    chatRoomId: {
      type: String, // unique room ID for a pair of users (optional but useful)
    },
  },
  {
    timestamps: true,
  }
)

const Message = mongoose.model('Message', messageSchema)
export default Message
