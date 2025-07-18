import express from 'express'
import {
  sendMessage,
  getMessagesBetweenUsers,
  getUserChatHistory,
  markMessagesAsRead,
  deleteMessage,
} from '../controllers/chatController.js'

import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 📌 POST /api/chats - Start new conversation between user & laborer
router.post('/', protect, sendMessage)

// In chatRoutes.js
router.get('/', protect, getMessagesBetweenUsers)


// 📌 GET /api/chats - Get all chats of logged-in user/laborer
router.get('/', protect, getUserChatHistory)

router.put('/read/:senderId', protect, markMessagesAsRead)

router.delete('/:chatId', protect, deleteMessage)

export default router

