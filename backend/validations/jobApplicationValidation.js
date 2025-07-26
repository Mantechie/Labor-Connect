import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validationMiddleware.js';
import { isValidObjectId } from '../utils/validationUtils.js';

export const applyToJobValidation = [
  body('jobId')
    .notEmpty().withMessage('Job ID is required')
    .custom(isValidObjectId).withMessage('Invalid job ID format'),
  
  body('applicantId')
    .notEmpty().withMessage('Applicant ID is required')
    .custom(isValidObjectId).withMessage('Invalid applicant ID format'),
  
  body('message')
    .optional()
    .isString().withMessage('Message must be a string')
    .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters'),
  
  validate
];

export const getApplicationsValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  
  query('job')
    .optional()
    .custom(isValidObjectId).withMessage('Invalid job ID format'),
  
  query('applicant')
    .optional()
    .custom(isValidObjectId).withMessage('Invalid applicant ID format'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  validate
];

export const jobIdParamValidation = [
  param('jobId')
    .custom(isValidObjectId).withMessage('Invalid job ID format'),
  validate
];

export const applicationIdParamValidation = [
  param('id')
    .custom(isValidObjectId).withMessage('Invalid application ID format'),
  validate
];
