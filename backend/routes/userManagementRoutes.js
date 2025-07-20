import express from 'express';
import { protectAdmin } from '../middlewares/adminAuthMiddleware.js';
import {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getUserStats,
  bulkUpdateUserStatus,
  updateUserRole,
  toggleUserBlock,
  verifyUserDocuments,
  getUserActivity,
  getUserComplaints,
  updateComplaintStatus,
  exportUsers,
  sendUserNotification
} from '../controllers/userManagementController.js';

const router = express.Router();

// All routes require admin authentication
router.use(protectAdmin);

// Get all users with pagination and filters
router.get('/', getAllUsers);

// Get user statistics
router.get('/stats', getUserStats);

// Export users data
router.get('/export', exportUsers);

// Get single user details
router.get('/:id', getUserDetails);

// Get user activity logs
router.get('/:id/activity', getUserActivity);

// Get user complaints
router.get('/:id/complaints', getUserComplaints);

// Update user status
router.put('/:id/status', updateUserStatus);

// Update user role
router.put('/:id/role', updateUserRole);

// Block/Unblock user
router.put('/:id/block', toggleUserBlock);

// Verify user documents
router.put('/:id/verify-documents', verifyUserDocuments);

// Update complaint status
router.put('/:id/complaints/:complaintId', updateComplaintStatus);

// Delete user (soft delete)
router.delete('/:id', deleteUser);

// Bulk update user status
router.put('/bulk-status', bulkUpdateUserStatus);

// Send notification to users
router.post('/notify', sendUserNotification);

export default router; 