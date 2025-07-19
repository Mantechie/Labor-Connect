import express from 'express';
import { protectAdmin, hasPermission } from '../middlewares/adminAuthMiddleware.js';
import {
  getAdminStats,
  getRecentActivity,
  getAllUsers,
  getAllLaborers,
  updateUserStatus,
  verifyLaborer,
  getJobApplications,
  getSystemHealth
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(protectAdmin);

// Dashboard and analytics
router.get('/stats', hasPermission('view_analytics'), getAdminStats);
router.get('/recent-activity', hasPermission('view_analytics'), getRecentActivity);
router.get('/system-health', hasPermission('system_settings'), getSystemHealth);

// User management
router.get('/users', hasPermission('manage_users'), getAllUsers);
router.put('/users/:id/status', hasPermission('manage_users'), updateUserStatus);

// Laborer management
router.get('/laborers', hasPermission('manage_laborers'), getAllLaborers);
router.put('/laborers/:id/verify', hasPermission('manage_laborers'), verifyLaborer);

// Job applications
router.get('/job-applications', hasPermission('manage_jobs'), getJobApplications);

export default router;
