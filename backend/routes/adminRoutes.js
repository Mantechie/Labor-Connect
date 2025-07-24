import express from 'express';
import { protectAdmin, hasPermission, isSuperAdmin } from '../middlewares/adminAuthMiddleware.js';
import {
  getAdminStats,
  getRecentActivity,
  getAllUsers,
  updateUserStatus,
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
  exportData
} from '../controllers/adminController.js';

import {
  getAllLaborers,
  updateLaborerVerification as verifyLaborer
} from '../controllers/laborerManagementController.js';

import {
  getAdminLogs,
  getRecentActivity as getRecentLogs,
  getSecurityEvents,
  getActivitySummary,
  getLoggedInAdmins,
  forceLogoutAllAdmins,
  exportLogs
} from '../controllers/adminLogController.js';

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

// Job management
router.get('/jobs', hasPermission('manage_jobs'), getJobApplications);
router.put('/jobs/:id/status', hasPermission('manage_jobs'), updateJobApplicationStatus);
router.delete('/jobs/:id', hasPermission('manage_jobs'), deleteJob);

// Reviews and ratings
router.get('/reviews', hasPermission('manage_reviews'), getRatingsAndReviews);

// Documents and verifications
router.get('/documents', hasPermission('manage_documents'), getDocumentsAndVerifications);

// Reports and issues
router.get('/reports', hasPermission('manage_reports'), getReportsAndIssues);

// Notifications
router.get('/notifications', hasPermission('manage_notifications'), getNotifications);

// Data export
router.get('/export', hasPermission('view_analytics'), exportData);

// Admin audit logs and security
router.get('/logs', hasPermission('system_settings'), getAdminLogs);
router.get('/logs/recent', hasPermission('system_settings'), getRecentLogs);
router.get('/logs/security', hasPermission('system_settings'), getSecurityEvents);
router.get('/logs/summary', hasPermission('system_settings'), getActivitySummary);
router.get('/logs/logged-in', hasPermission('system_settings'), getLoggedInAdmins);
router.post('/logs/force-logout-all', isSuperAdmin, forceLogoutAllAdmins);
router.get('/logs/export', hasPermission('system_settings'), exportLogs);

export default router;
