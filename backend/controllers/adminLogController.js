// h:\Labour\backend\controllers\adminLogController.js

import AdminLog from '../models/AdminLog.js';
import Admin from '../models/Admin.js';
import { asyncHandler, logError } from '../utils/errorhandlerutil.js';
import { parseDate, isValidDate, getEndOfDay } from '../utils/dateUtils.js';
import { 
  isValidObjectId, 
  isValidEnum, 
  validatePagination,
  sanitizeString,
  maskEmail,
  maskIpAddress
} from '../utils/validationUtils.js';
import { adminLogCache } from '../utils/cacheUtils.js';
import mongoose from 'mongoose';

// Constants for environment variables with defaults
const MAX_PAGE_SIZE = process.env.ADMIN_LOG_MAX_PAGE_SIZE || 100;
const DEFAULT_PAGE_SIZE = process.env.ADMIN_LOG_DEFAULT_PAGE_SIZE || 50;
const EXPORT_LIMIT = process.env.ADMIN_LOG_EXPORT_LIMIT || 1000;
const CACHE_ENABLED = process.env.ADMIN_LOG_CACHE_ENABLED !== 'false';

// Valid enum values from the model
const VALID_ACTIONS = [
  'LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'PASSWORD_CHANGE', 
  'OTP_GENERATE', 'OTP_VERIFY', 'ADMIN_CREATE', 'ADMIN_UPDATE', 
  'ADMIN_DELETE', 'SYSTEM_CONFIG', 'SECURITY_EVENT', 'FORCE_LOGOUT',
  'FAILED_LOGIN_ATTEMPT', 'ACCOUNT_LOCKED', 'SESSION_EXPIRED',
  'PROFILE_PICTURE_UPDATE', 'COLLABORATOR_ADDED', 'COLLABORATOR_REMOVED',
  'NOTIFICATION_SENT', 'AUDIT_LOG_VIEWED'
];

const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_STATUSES = ['SUCCESS', 'FAILED', 'PENDING', 'CANCELLED'];

/**
 * @desc    Get admin audit logs with pagination and filters
 * @route   GET /api/admin/logs
 * @access  Admin only (requires 'view_audit_logs' permission)
 * @param   {Object} req.query - Query parameters
 * @param   {number} [req.query.page=1] - Page number (1-based)
 * @param   {number} [req.query.limit=50] - Items per page (1-100)
 * @param   {string} [req.query.action] - Filter by action type
 * @param   {string} [req.query.severity] - Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
 * @param   {string} [req.query.status] - Filter by status (SUCCESS, FAILED, PENDING, CANCELLED)
 * @param   {string} [req.query.adminId] - Filter by admin ID
 * @param   {string} [req.query.startDate] - Filter by start date (ISO format)
 * @param   {string} [req.query.endDate] - Filter by end date (ISO format)
 * @returns {Object} Paginated logs with metadata
 */
export const getAdminLogs = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = DEFAULT_PAGE_SIZE, 
    action = '', 
    severity = '', 
    status = '', 
    adminId = '',
    startDate = '',
    endDate = ''
  } = req.query;

  // Validate pagination parameters
  const { page: validPage, limit: validLimit } = validatePagination(page, limit, MAX_PAGE_SIZE);
  
  // Validate other parameters
  if (action && !isValidEnum(action, VALID_ACTIONS)) {
    return res.status(400).json({ message: 'Invalid action parameter' });
  }
  
  if (severity && !isValidEnum(severity, VALID_SEVERITIES)) {
    return res.status(400).json({ message: 'Invalid severity parameter' });
  }
  
  if (status && !isValidEnum(status, VALID_STATUSES)) {
    return res.status(400).json({ message: 'Invalid status parameter' });
  }
  
  if (adminId && !isValidObjectId(adminId)) {
    return res.status(400).json({ message: 'Invalid adminId format' });
  }
  
  if (startDate && !isValidDate(startDate)) {
    return res.status(400).json({ message: 'Invalid start date format' });
  }
  
  if (endDate && !isValidDate(endDate)) {
    return res.status(400).json({ message: 'Invalid end date format' });
  }

  // Build filters
  const filters = {};
  if (action) filters.action = action;
  if (severity) filters.severity = severity;
  if (status) filters.status = status;
  if (adminId) filters.adminId = mongoose.Types.ObjectId(adminId);
  
  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) {
      const parsedStartDate = parseDate(startDate);
      if (parsedStartDate) filters.createdAt.$gte = parsedStartDate;
    }
    if (endDate) {
      const parsedEndDate = parseDate(endDate);
      if (parsedEndDate) {
        // Set to end of day for inclusive end date
        filters.createdAt.$lte = getEndOfDay(parsedEndDate);
      }
    }
  }

  // Get logs with pagination
  const result = await AdminLog.getLogs(filters, validPage, validLimit);

  // Log this access (but don't wait for it)
  AdminLog.createLog({
    adminId: req.admin._id,
    adminEmail: req.admin.email,
    action: 'AUDIT_LOG_VIEWED',
    details: `Viewed admin logs with filters: ${JSON.stringify({
      page: validPage,
      limit: validLimit,
      action,
      severity,
      status,
      adminId,
      startDate,
      endDate
    })}`,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    severity: 'LOW',
    status: 'SUCCESS'
  }).catch(err => logError('Log access recording', err));

  res.json({
    logs: result.logs,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    filters: {
      action,
      severity,
      status,
      adminId,
      startDate,
      endDate
    }
  });
});

/**
 * @desc    Get recent admin activity
 * @route   GET /api/admin/logs/recent
 * @access  Admin only (requires 'view_audit_logs' permission)
 * @param   {Object} req.query - Query parameters
 * @param   {number} [req.query.limit=10] - Number of recent activities to fetch
 * @returns {Object} Recent activity logs
 */
export const getRecentActivity = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  // Validate limit
  const validLimit = Math.min(Math.max(parseInt(limit), 1), 50);
  
  if (isNaN(validLimit)) {
    return res.status(400).json({ message: 'Invalid limit parameter' });
  }
  
  const logs = await AdminLog.getRecentActivity(validLimit);

  res.json({
    logs,
    total: logs.length
  });
});

/**
 * @desc    Get security events
 * @route   GET /api/admin/logs/security
 * @access  Admin only (requires 'view_audit_logs' permission)
 * @param   {Object} req.query - Query parameters
 * @param   {number} [req.query.days=7] - Number of days to look back
 * @returns {Object} Security events
 */
export const getSecurityEvents = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  
  // Validate days parameter
  const validDays = parseInt(days);
  
  if (isNaN(validDays) || validDays < 1 || validDays > 90) {
    return res.status(400).json({ 
      message: 'Invalid days parameter (must be between 1-90)' 
    });
  }
  
  const events = await AdminLog.getSecurityEvents(validDays);

  res.json({
    events,
    total: events.length,
    period: `${validDays} days`
  });
});

/**
 * @desc    Get admin activity summary
 * @route   GET /api/admin/logs/summary
 * @access  Admin only (requires 'view_audit_logs' permission)
 * @param   {Object} req.query - Query parameters
 * @param   {number} [req.query.days=30] - Number of days to include in summary
 * @returns {Object} Activity summary statistics
 */
export const getActivitySummary = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  // Validate days parameter
  const validDays = parseInt(days);
  
  if (isNaN(validDays) || validDays < 1 || validDays > 365) {
    return res.status(400).json({ 
      message: 'Invalid days parameter (must be between 1-365)' 
    });
  }
  
  // Check cache first if enabled
  if (CACHE_ENABLED) {
    const cacheKey = `activity_summary_${validDays}`;
    const cachedData = adminLogCache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
  }
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - validDays);

  // Get activity counts by type
  const activityCounts = await AdminLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get severity distribution
  const severityDistribution = await AdminLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get status distribution
  const statusDistribution = await AdminLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get top active admins
  const topAdmins = await AdminLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$adminId',
        actionCount: { $sum: 1 }
      }
    },
    {
      $sort: { actionCount: -1 }
    },
    {
      $limit: 5
    },
    {
      $lookup: {
        from: 'admins',
        localField: '_id',
        foreignField: '_id',
        as: 'admin'
      }
    },
    {
      $unwind: '$admin'
    },
    {
      $project: {
        adminId: '$_id',
        adminName: '$admin.name',
        // Don't expose full email in the response
        adminEmail: { $concat: [
          { $substr: [ "$admin.email", 0, 1 ] },
          "***",
          { $substr: [ "$admin.email", { $subtract: [ { $strLenCP: "$admin.email" }, 
                                                     { $subtract: [ { $strLenCP: { $arrayElemAt: [ { $split: [ "$admin.email", "@" ] }, 1 ] } }, 
                                                                   { $add: [ { $strLenCP: { $arrayElemAt: [ { $split: [ "$admin.email", "@" ] }, 1 ] } }, 1 ] } ] } ] }, 
                      { $add: [ { $strLenCP: { $arrayElemAt: [ { $split: [ "$admin.email", "@" ] }, 1 ] } }, 1 ] } ] }
        ]},
        actionCount: 1
      }
    }
  ]);

  const result = {
    period: `${validDays} days`,
    activityCounts,
    severityDistribution,
    statusDistribution,
    topAdmins,
    totalLogs: activityCounts.reduce((sum, item) => sum + item.count, 0)
  };
  
  // Store in cache if enabled
  if (CACHE_ENABLED) {
    adminLogCache.set(`activity_summary_${validDays}`, result);
  }

  res.json(result);
});

/**
 * @desc    Get logged in admins
 * @route   GET /api/admin/logs/logged-in
 * @access  Admin only (requires 'view_audit_logs' permission)
 * @returns {Object} Currently logged in admins
 */
export const getLoggedInAdmins = asyncHandler(async (req, res) => {
  const loggedInAdmins = await Admin.getLoggedInAdmins();

  res.json({
    admins: loggedInAdmins,
    total: loggedInAdmins.length
  });
});

/**
 * @desc    Force logout all admins
 * @route   POST /api/admin/logs/force-logout-all
 * @access  Super Admin only
 * @returns {Object} Result of the operation
 */
export const forceLogoutAllAdmins = asyncHandler(async (req, res) => {
  // Require confirmation in the request body
  const { confirm } = req.body;
  
  if (!confirm || confirm !== 'FORCE_LOGOUT_ALL') {
    return res.status(400).json({ 
      message: 'Confirmation required. Please provide "confirm": "FORCE_LOGOUT_ALL" in the request body' 
    });
  }
  
  const result = await Admin.forceLogoutAll();

  // Log this action
  await AdminLog.createLog({
    adminId: req.admin._id,
    adminEmail: req.admin.email,
    action: 'FORCE_LOGOUT',
    details: 'All admins force logged out',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    severity: 'HIGH',
    status: 'SUCCESS'
  });

  // Clear cache after this operation
  if (CACHE_ENABLED) {
    adminLogCache.clear();
  }

  res.json({
    message: 'All admins have been logged out',
    affectedCount: result.modifiedCount
  });
});

/**
 * @desc    Export logs to CSV
 * @route   GET /api/admin/logs/export
 * @access  Admin only (requires 'view_audit_logs' permission)
 * @param   {Object} req.query - Query parameters
 * @param   {string} [req.query.startDate] - Start date for filtering
 * @param   {string} [req.query.endDate] - End date for filtering
 * @param   {string} [req.query.action] - Filter by action
 * @returns {File} CSV file download
 */
export const exportLogs = asyncHandler(async (req, res) => {
  const { startDate = '', endDate = '', action = '' } = req.query;
  
  // Validate parameters
  if (startDate && !isValidDate(startDate)) {
    return res.status(400).json({ message: 'Invalid start date format' });
  }
  
  if (endDate && !isValidDate(endDate)) {
    return res.status(400).json({ message: 'Invalid end date format' });
  }
  
  if (action && !isValidEnum(action, VALID_ACTIONS)) {
    return res.status(400).json({ message: 'Invalid action parameter' });
  }

  // Build filters
  const filters = {};
  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) {
      const parsedStartDate = parseDate(startDate);
      if (parsedStartDate) filters.createdAt.$gte = parsedStartDate;
    }
    if (endDate) {
      const parsedEndDate = parseDate(endDate);
      if (parsedEndDate) {
        filters.createdAt.$lte = getEndOfDay(parsedEndDate);
      }
    }
  }
  if (action) filters.action = action;

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=admin-logs-${new Date().toISOString().split('T')[0]}.csv`);
  
  // Write CSV headers
  const csvHeaders = [
    'Timestamp',
    'Admin Name',
    'Admin Email',
    'Action',
    'Details',
    'IP Address',
    'Severity',
    'Status'
  ];
  res.write(csvHeaders.map(header => `"${header}"`).join(',') + '\n');
  
  // Stream results in batches
  const batchSize = 100;
  let skip = 0;
  let hasMore = true;
  
  // Log this export operation
  AdminLog.createLog({
    adminId: req.admin._id,
    adminEmail: req.admin.email,
    action: 'AUDIT_LOG_EXPORT',
    details: `Exported logs with filters: ${JSON.stringify({
      startDate,
      endDate,
      action
    })}`,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    severity: 'MEDIUM',
    status: 'SUCCESS'
  }).catch(err => logError('Log export recording', err));

  while (hasMore) {
    const logs = await AdminLog.find(filters)
      .populate('adminId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(batchSize);
    
    if (logs.length === 0) {
      hasMore = false;
      break;
    }
    
    // Process and write each batch
    for (const log of logs) {
      const row = [
        log.createdAt.toISOString(),
        sanitizeString(log.adminId?.name || 'Unknown'),
        maskEmail(log.adminId?.email || log.adminEmail || ''),
        log.action,
        sanitizeString(log.details || ''),
        maskIpAddress(log.ipAddress || ''),
        log.severity,
        log.status
      ].map(field => `"${field}"`).join(',');
      
      res.write(row + '\n');
    }
    
    skip += batchSize;
    
    // Safety limit to prevent excessive data export
    if (skip >= EXPORT_LIMIT) {
      hasMore = false;
    }
  }
  
  res.end();
});
