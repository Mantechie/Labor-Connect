import express from 'express'
import {
  sendMessage,
  getMessagesBetweenUsers,
  getUserChatHistory,
  markMessagesAsRead,
  deleteMessage,
} from '../controllers/chatController.js'

import { protect } from '../middlewares/authMiddleware.js'
import { chatLimiter } from '../middlewares/ratelimiter.js';
import { 
  validateSendMessage,
  validateGetMessagesBetweenUsers,
  validateGetUserChatHistory,
  validateMarkMessagesAsRead,
  validateDeleteMessage
} from '../middlewares/chatValidation.js';
import { isChatParticipant } from '../middlewares/chatMiddleware.js';

const router = express.Router()

// Apply rate limiting to all chat routes
router.use(chatLimiter);

// Send message
router.post('/', protect, validateSendMessage, sendMessage);

// Get messages between users
router.get('/:user1/:user2', protect, validateGetMessagesBetweenUsers, getMessagesBetweenUsers);

// Get user chat history
router.get('/user/:userId', protect, validateGetUserChatHistory, getUserChatHistory);

// Mark messages as read
router.put('/read/:senderId', protect, validateMarkMessagesAsRead, markMessagesAsRead);

// Delete message
router.delete('/:chatId', protect, validateDeleteMessage, isChatParticipant, deleteMessage);

export default router

