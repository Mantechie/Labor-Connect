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
  getSystemHealth,
  // New admin functions
  getRatingsAndReviews,
  getDocumentsAndVerifications,
  getReportsAndIssues,
  getNotifications,
  updateJobApplicationStatus,
  deleteUser,
  deleteJob,
  getAdminAnalytics,
  sendNotification,
  updateSystemSettings,
  getAdminLogs,
  exportData
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(protectAdmin);

// Dashboard and analytics
router.get('/stats', hasPermission('view_analytics'), getAdminStats);
router.get('/recent-activity', hasPermission('view_analytics'), getRecentActivity);
router.get('/system-health', hasPermission('system_settings'), getSystemHealth);
router.get('/analytics', hasPermission('view_analytics'), getAdminAnalytics);

// User management
router.get('/users', hasPermission('manage_users'), getAllUsers);
router.put('/users/:id/status', hasPermission('manage_users'), updateUserStatus);
router.delete('/users/:id', hasPermission('manage_users'), deleteUser);

// Laborer management
router.get('/laborers', hasPermission('manage_laborers'), getAllLaborers);
router.put('/laborers/:id/verify', hasPermission('manage_laborers'), verifyLaborer);

// Job applications
router.get('/job-applications', hasPermission('manage_jobs'), getJobApplications);
router.put('/job-applications/:id/status', hasPermission('manage_jobs'), updateJobApplicationStatus);

// Ratings and reviews
router.get('/ratings', hasPermission('manage_reviews'), getRatingsAndReviews);

// Documents and verifications
router.get('/documents', hasPermission('manage_documents'), getDocumentsAndVerifications);

// Reports and issues
router.get('/reports', hasPermission('manage_reports'), getReportsAndIssues);

// Notifications
router.get('/notifications', hasPermission('manage_notifications'), getNotifications);
router.post('/notifications/send', hasPermission('manage_notifications'), sendNotification);

// System management
router.put('/system/settings', hasPermission('system_settings'), updateSystemSettings);
router.get('/logs', hasPermission('system_settings'), getAdminLogs);
router.get('/export/:type', hasPermission('system_settings'), exportData);

// Job management
router.delete('/jobs/:id', hasPermission('manage_jobs'), deleteJob);

export default router;
