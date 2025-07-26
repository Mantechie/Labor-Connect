import { body, query, param, validationResult } from 'express-validator';
import { LABORER_STATUSES, SORT_ORDERS } from '../constants/index.js';

/**
 * Validation middleware for get all laborers endpoint
 */
export const getLaborersValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim().escape(),
  query('status').optional().isIn(Object.values(LABORER_STATUSES)),
  query('specialization').optional().trim().escape(),
  query('verified').optional().isBoolean().toBoolean(),
  query('sortBy').optional().isIn(['createdAt', 'name', 'rating']),
  query('sortOrder').optional().isIn(Object.values(SORT_ORDERS)),
  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

/**
 * Validation middleware for get laborer details endpoint
 */
export const getLaborerDetailsValidation = [
  param('id').isMongoId().withMessage('Invalid laborer ID'),
  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

/**
 * Validation middleware for update laborer status endpoint
 */
export const updateLaborerStatusValidation = [
  param('id').isMongoId().withMessage('Invalid laborer ID'),
  body('status').isIn(Object.values(LABORER_STATUSES)).withMessage('Invalid status'),
  body('reason').optional().trim().isLength({ min: 3, max: 500 }).withMessage('Reason must be between 3 and 500 characters'),
  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

/**
 * Validation middleware for update laborer verification endpoint
 */
export const updateLaborerVerificationValidation = [
  param('id').isMongoId().withMessage('Invalid laborer ID'),
  body('isVerified').isBoolean().withMessage('isVerified must be a boolean'),
  body('reason').optional().trim().isLength({ min: 3, max: 500 }).withMessage('Reason must be between 3 and 500 characters'),
  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

/**
 * Validation middleware for delete laborer endpoint
 */
export const deleteLaborerValidation = [
  param('id').isMongoId().withMessage('Invalid laborer ID'),
  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

/**
 * Validation middleware for export laborers endpoint
 */
export const exportLaborersValidation = [
  query('format').optional().isIn(['csv', 'json']).withMessage('Format must be csv or json'),
  query('specialization').optional().trim().escape(),
  query('status').optional().isIn(Object.values(LABORER_STATUSES)),
  query('verified').optional().isBoolean().toBoolean(),
  query('rating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];
