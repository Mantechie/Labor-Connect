// Create a new file: h:\Labour\backend\middlewares\chatValidation.js

import { body, param } from 'express-validator';
import { checkValidation } from './validation.js';
import mongoose from 'mongoose';

// Validate message sending
export const validateSendMessage = [
  body('sender')
    .notEmpty().withMessage('Sender ID is required')
    .isMongoId().withMessage('Invalid sender ID format')
    .custom((value, { req }) => {
      // Ensure sender matches authenticated user
      if (value !== req.user.id) {
        throw new Error('Sender ID must match authenticated user');
      }
      return true;
    }),
  
  body('receiver')
    .notEmpty().withMessage('Receiver ID is required')
    .isMongoId().withMessage('Invalid receiver ID format'),
  
  body('message')
    .optional()
    .isString().withMessage('Message must be a string')
    .trim()
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
  
  body('media')
    .optional()
    .isURL().withMessage('Media must be a valid URL')
    .trim(),
  
  checkValidation
];

// Validate getting messages between users
export const validateGetMessagesBetweenUsers = [
  param('user1')
    .isMongoId().withMessage('Invalid user ID format')
    .custom((value, { req }) => {
      // Ensure user is authorized to view these messages
      if (value !== req.user.id && req.user.role !== 'admin') {
        throw new Error('Not authorized to view these messages');
      }
      return true;
    }),
  
  param('user2')
    .isMongoId().withMessage('Invalid user ID format'),
  
  checkValidation
];

// Validate getting user chat history
export const validateGetUserChatHistory = [
  param('userId')
    .isMongoId().withMessage('Invalid user ID format')
    .custom((value, { req }) => {
      // Ensure user is authorized to view these messages
      if (value !== req.user.id && req.user.role !== 'admin') {
        throw new Error('Not authorized to view these messages');
      }
      return true;
    }),
  
  checkValidation
];

// Validate marking messages as read
export const validateMarkMessagesAsRead = [
  param('senderId')
    .isMongoId().withMessage('Invalid sender ID format'),
  
  checkValidation
];

// Validate deleting a message
export const validateDeleteMessage = [
  param('chatId')
    .isMongoId().withMessage('Invalid chat ID format'),
  
  checkValidation
];
