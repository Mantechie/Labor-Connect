import express from 'express';
import { protectAdmin } from '../middlewares/adminAuthMiddleware.js';
import {
  getAllLaborers,
  getLaborerDetails,
  updateLaborerStatus,
  updateLaborerVerification,
  deleteLaborer,
  getLaborerStats,
  bulkUpdateLaborerStatus,
  getSpecializations
} from '../controllers/laborerManagementController.js';

const router = express.Router();

// All routes require admin authentication
router.use(protectAdmin);

// Get all laborers with pagination and filters
router.get('/', getAllLaborers);

// Get laborer statistics
router.get('/stats', getLaborerStats);

// Get specializations list
router.get('/specializations', getSpecializations);

// Get single laborer details
router.get('/:id', getLaborerDetails);

// Update laborer status
router.put('/:id/status', updateLaborerStatus);

// Update laborer verification
router.put('/:id/verify', updateLaborerVerification);

// Delete laborer (soft delete)
router.delete('/:id', deleteLaborer);

// Bulk update laborer status
router.put('/bulk-status', bulkUpdateLaborerStatus);

export default router; 