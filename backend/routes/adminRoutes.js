import express from 'express';
import { protectAdmin, hasPermission, isSuperAdmin } from '../middlewares/adminAuthMiddleware.js';
import { preventPrivilegeEscalation, requirePermission } from '../middlewares/adminPrivilegeMiddleware.js';
import { adminLogLimiter, logExportLimiter, securityOperationLimiter } from '../middlewares/adminRateLimiter.js';
import csrf from 'csurf';
import { addCorrelationId } from '../middlewares/correlationMiddleware.js';
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
  getLaborerDetails,
  updateLaborerStatus,
  updateLaborerVerification,
  deleteLaborer,
  getLaborerStats,
  exportLaborerData
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

import { 
  getLaborersValidation,
  getLaborerDetailsValidation,
  updateLaborerStatusValidation,
  updateLaborerVerificationValidation,
  deleteLaborerValidation,
  exportLaborersValidation
} from '../middlewares/laborerValidation.js';

const router = express.Router();

// CSRF protection for POST/PUT/DELETE requests
const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection to all routes
router.use(csrfProtection);

// All admin routes require admin authentication
router.use(protectAdmin);


// Apply correlation ID middleware to all routes
router.use(addCorrelationId);

// Apply admin protection middleware to all routes
router.use(protectAdmin);

// Dashboard and analytics
router.get('/stats', requirePermission('view_analytics'), getAdminStats);
router.get('/recent-activity', requirePermission('view_analytics'), getRecentActivity);
router.get('/system-health', requirePermission('system_settings'), getSystemHealth);
router.get('/analytics', requirePermission('view_analytics'), getAdminAnalytics);

// User management
router.get('/users', requirePermission('manage_users'), getAllUsers);
router.put('/users/:id/status', requirePermission('manage_users'), updateUserStatus);
router.delete('/users/:id', requirePermission('manage_users'), deleteUser);

// Laborer management routes
router.get('/laborers', getLaborersValidation, getAllLaborers);
router.get('/laborers/stats', getLaborerStats);
router.get('/laborers/export', logExportLimiter, exportLaborersValidation, exportLaborerData);
router.get('/laborers/:id', getLaborerDetailsValidation, getLaborerDetails);
router.put('/laborers/:id/status', securityOperationLimiter, updateLaborerStatusValidation, updateLaborerStatus);
router.put('/laborers/:id/verify', securityOperationLimiter, updateLaborerVerificationValidation, updateLaborerVerification);
router.delete('/laborers/:id', securityOperationLimiter, deleteLaborerValidation, deleteLaborer);

// Job management
router.get('/jobs', requirePermission('manage_jobs'), getJobApplications);
router.put('/jobs/:id/status', requirePermission('manage_jobs'), updateJobApplicationStatus);
router.delete('/jobs/:id', requirePermission('manage_jobs'), deleteJob);

// Reviews and ratings
router.get('/reviews', requirePermission('manage_reviews'), getRatingsAndReviews);

// Documents and verifications
router.get('/documents', requirePermission('manage_documents'), getDocumentsAndVerifications);

// Reports and issues
router.get('/reports', requirePermission('manage_reports'), getReportsAndIssues);

// Notifications
router.get('/notifications', requirePermission('manage_notifications'), getNotifications);

// Data export
router.get('/export', requirePermission('view_analytics'), exportData);

// Admin audit logs and security - with enhanced security
router.get(
  '/logs', 
  adminLogLimiter, 
  requirePermission('view_audit_logs'), 
  preventPrivilegeEscalation, 
  getAdminLogs
);

router.get(
  '/logs/recent', 
  adminLogLimiter, 
  requirePermission('view_audit_logs'), 
  getRecentLogs
);

router.get(
  '/logs/security', 
  adminLogLimiter, 
  requirePermission('view_audit_logs'), 
  getSecurityEvents
);

router.get(
  '/logs/summary', 
  adminLogLimiter, 
  requirePermission('view_audit_logs'), 
  getActivitySummary
);

router.get(
  '/logs/logged-in', 
  adminLogLimiter, 
  requirePermission('view_audit_logs'), 
  getLoggedInAdmins
);

router.post(
  '/logs/force-logout-all', 
  securityOperationLimiter,
  csrfProtection,
  isSuperAdmin, 
  forceLogoutAllAdmins
);

router.get(
  '/logs/export', 
  logExportLimiter, 
  requirePermission('view_audit_logs'), 
  preventPrivilegeEscalation, 
  exportLogs
);

export default router;
