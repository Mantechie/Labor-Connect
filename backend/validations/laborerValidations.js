import { body, param, query } from 'express-validator';
import { checkValidation } from '../middlewares/validation.js';

// Validate laborer profile update
export const validateProfileUpdate = [
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .isString().withMessage('Each skill must be a string')
    .trim(),
  
  body('specialization')
    .optional()
    .isString().withMessage('Specialization must be a string')
    .trim(),
  
  body('experience')
    .optional()
    .isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  
  body('dailyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Daily rate must be a positive number'),
  
  body('bio')
    .optional()
    .isString().withMessage('Bio must be a string')
    .trim(),
  
  checkValidation
];

// Validate availability update
export const validateAvailabilityUpdate = [
  body('availability')
    .notEmpty().withMessage('Availability is required')
    .isIn(['available', 'unavailable', 'busy']).withMessage('Invalid availability status'),
  
  checkValidation
];

// Validate job action (accept/reject)
export const validateJobAction = [
  param('jobId')
    .isMongoId().withMessage('Invalid job ID format'),
  
  param('action')
    .isIn(['accept', 'reject']).withMessage('Action must be either accept or reject'),
  
  checkValidation
];

// Validate portfolio item addition
export const validatePortfolioItem = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),
  
  body('category')
    .optional()
    .isString().withMessage('Category must be a string')
    .trim(),
  
  checkValidation
];

// Validate browse laborers query parameters
export const validateBrowseLaborers = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  
  query('search')
    .optional()
    .isString().withMessage('Search must be a string')
    .trim(),
  
  query('skill')
    .optional()
    .isString().withMessage('Skill must be a string')
    .trim(),
  
  query('location')
    .optional()
    .isString().withMessage('Location must be a string')
    .trim(),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
  
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  
  query('availability')
    .optional()
    .isIn(['available', 'unavailable', 'busy']).withMessage('Invalid availability status'),
  
  query('sort')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort must be either asc or desc'),
  
  checkValidation
];
