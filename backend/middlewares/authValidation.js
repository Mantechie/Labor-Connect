// File: h:\Labour\backend\middlewares\authValidation.js

import { body } from 'express-validator';
import { checkValidation } from './validation.js';

/**
 * Password strength validation
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 */
const strongPasswordValidation = () => 
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character');

/**
 * Registration validation rules
 */
export const validateRegistration = [
  // Name validation
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  // Email validation
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  // Password validation
  strongPasswordValidation(),
  
  // Role validation
  body('role')
    .optional()
    .isIn(['user', 'laborer', 'admin']).withMessage('Role must be user, laborer, or admin'),
  
  // Phone validation
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  
  checkValidation
];

/**
 * Login validation rules
 */
export const validateLogin = [
  // Email validation
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  // Password validation
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  checkValidation
];

/**
 * Send OTP validation rules
 */
export const validateSendOtp = [
  // Either email or phone must be provided
  body()
    .custom((body) => {
      if (!body.email && !body.phone) {
        throw new Error('Either email or phone is required');
      }
      return true;
    }),
  
  // Email validation (if provided)
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  // Phone validation (if provided)
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  
  checkValidation
];

/**
 * Verify OTP validation rules
 */
export const validateVerifyOtp = [
  // Either email or phone must be provided
  body()
    .custom((body) => {
      if (!body.email && !body.phone) {
        throw new Error('Either email or phone is required');
      }
      return true;
    }),
  
  // Email validation (if provided)
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  // Phone validation (if provided)
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  
  // OTP validation
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
  
  checkValidation
];

/**
 * Refresh token validation rules
 */
export const validateRefreshToken = [
  // Refresh token validation
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
  
  checkValidation
];

export default {
  validateRegistration,
  validateLogin,
  validateSendOtp,
  validateVerifyOtp,
  validateRefreshToken
};
