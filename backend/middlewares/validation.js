// File: h:\Labour\backend\middleware\validation.js

import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Middleware to check validation results
export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// Validation for verifyLaborer endpoint
export const validateVerifyLaborer = [
  param('id')
    .isMongoId().withMessage('Invalid laborer ID format'),
  
  body('isVerified')
    .isBoolean().withMessage('isVerified must be a boolean value'),
  
  body('verificationNotes')
    .optional()
    .isString().withMessage('Verification notes must be a string')
    .trim(),
  
  checkValidation
];

// Validation for updateUserStatus endpoint
export const validateUpdateUserStatus = [
  param('id')
    .isMongoId().withMessage('Invalid user ID format'),
  
  body('isActive')
    .isBoolean().withMessage('isActive must be a boolean value'),
  
  checkValidation
];

// Validation for pagination and filtering
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  checkValidation
];
