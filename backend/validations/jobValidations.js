import { body, query, param } from 'express-validator';
import { checkValidation } from '../middlewares/validation.js';

export const validateJobCreation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    
  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
    
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['plumber', 'electrician', 'mason', 'carpenter', 'painter', 'welder', 'other'])
    .withMessage('Invalid category selected'),
    
  body('budget')
    .isNumeric().withMessage('Budget must be a number')
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
    
  body('media')
    .optional()
    .isArray().withMessage('Media must be an array'),
    
  body('media.*')
    .optional()
    .isURL().withMessage('Media items must be valid URLs'),
    
  checkValidation
];

export const validateJobUpdate = [
  param('id')
    .isMongoId().withMessage('Invalid job ID format'),
    
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    
  body('location')
    .optional()
    .trim(),
    
  body('category')
    .optional()
    .trim()
    .isIn(['plumber', 'electrician', 'mason', 'carpenter', 'painter', 'welder', 'other'])
    .withMessage('Invalid category selected'),
    
  body('budget')
    .optional()
    .isNumeric().withMessage('Budget must be a number')
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
    
  body('media')
    .optional()
    .isArray().withMessage('Media must be an array'),
    
  body('media.*')
    .optional()
    .isURL().withMessage('Media items must be valid URLs'),
    
  checkValidation
];

export const validateJobFilters = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
  query('category')
    .optional()
    .isIn(['plumber', 'electrician', 'mason', 'carpenter', 'painter', 'welder', 'other'])
    .withMessage('Invalid category'),
    
  query('location')
    .optional()
    .trim(),
    
  query('minBudget')
    .optional()
    .isNumeric().withMessage('Minimum budget must be a number')
    .isFloat({ min: 0 }).withMessage('Minimum budget must be a positive number'),
    
  query('maxBudget')
    .optional()
    .isNumeric().withMessage('Maximum budget must be a number')
    .isFloat({ min: 0 }).withMessage('Maximum budget must be a positive number'),
    
  query('status')
    .optional()
    .isIn(['open', 'in progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
    
  query('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
    
  query('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date'),
    
  query('search')
    .optional()
    .trim(),
    
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'budget', 'title'])
    .withMessage('Invalid sort field'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
    
  checkValidation
];
