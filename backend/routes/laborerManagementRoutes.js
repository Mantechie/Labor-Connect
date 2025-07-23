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
  getSpecializations,
  getLaborerComplaints,
  updateComplaintStatus,
  sendWarning,
  suspendLaborer,
  unsuspendLaborer,
  sendNotificationToLaborers,
  exportLaborerData,
  getLaborerReviews,
  moderatePortfolioItem,
  addLaborer
} from '../controllers/laborerManagementController.js';

const router = express.Router();

// All routes require admin authentication
router.use(protectAdmin);

// Get all laborers with pagination and filters
router.get('/', getAllLaborers);

// Add new laborer
router.post('/', addLaborer);

// Get laborer statistics
router.get('/stats', getLaborerStats);

// Get specializations list
router.get('/specializations', getSpecializations);

// Export laborer data
router.get('/export', exportLaborerData);

// Send notification to laborers
router.post('/notify', sendNotificationToLaborers);

// Bulk update laborer status
router.put('/bulk-status', bulkUpdateLaborerStatus);

// Get single laborer details
router.get('/:id', getLaborerDetails);

// Get laborer complaints
router.get('/:id/complaints', getLaborerComplaints);

// Get laborer reviews
router.get('/:id/reviews', getLaborerReviews);

// Update laborer status
router.put('/:id/status', updateLaborerStatus);

// Update laborer verification
router.put('/:id/verify', updateLaborerVerification);

// Update complaint status
router.put('/:id/complaints/:complaintId', updateComplaintStatus);

// Send warning to laborer
router.post('/:id/warning', sendWarning);

// Suspend laborer
router.post('/:id/suspend', suspendLaborer);

// Unsuspend laborer
router.post('/:id/unsuspend', unsuspendLaborer);

// Moderate portfolio item
router.put('/:id/portfolio/:portfolioId', moderatePortfolioItem);

// Delete laborer (soft delete)
router.delete('/:id', deleteLaborer);

export default router; 