import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Laborer from '../models/Laborer.js';
import Admin from '../models/Admin.js';
import AdminLog from '../models/AdminLog.js';
import asyncHandler from 'express-async-handler';
import { logger } from '../utils/Logger.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';
import { LABORER_STATUSES, SORT_ORDERS, SEVERITY_LEVELS, ADMIN_ACTIONS, LOG_STATUS } from '../constants/index.js';
import * as laborerService from '../services/laborerService.js';
import { notifyAdmins } from '../services/notificationService.js';

// @desc    Add new laborer
// @route   POST /api/admin/laborers
// @access  Admin only
export const addLaborer = asyncHandler(async (req, res) => {
  const { name, email, phone, specialization, status } = req.body;

  try {
    // Check if laborer already exists
    const existingLaborer = await Laborer.findOne({ email });
    if (existingLaborer) {
      return errorResponse(res, 'Laborer with this email already exists', 409);
    }

    // Create new laborer
    const laborer = await laborerService.createLaborer({
      name,
      email,
      phone,
      specialization,
      status: status || LABORER_STATUSES.ACTIVE
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Added new laborer - ${email}`,
      severity: SEVERITY_LEVELS.MEDIUM,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId
    });

    return successResponse(res, {
      message: 'Laborer added successfully',
      laborer: {
        id: laborer._id,
        email: laborer.email,
        name: laborer.name,
        status: laborer.status,
        specialization: laborer.specialization
      }
    });
  } catch (error) {
    logger.error(`Error adding laborer: ${error.message}`, { error, correlationId: req.correlationId });
    
    // Log the failed action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Failed to add laborer - ${email}`,
      severity: SEVERITY_LEVELS.HIGH,
      status: LOG_STATUS.FAILED,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { error: error.message },
      correlationId: req.correlationId
    });

    return errorResponse(res, 'Failed to add laborer', 500);
  }
});

// @desc    Get all laborers with pagination and filters
// @route   GET /api/admin/laborers
// @access  Admin only
export const getAllLaborers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    status = '', 
    specialization = '', 
    verified = '', 
    sortBy = 'createdAt', 
    sortOrder = SORT_ORDERS.DESC 
  } = req.query;
  
  // Build filter object
  const filter = { isDeleted: { $ne: true } };
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) {
    filter.status = status;
  }

  if (specialization) {
    filter.specialization = specialization;
  }

  if (verified !== '') {
    filter.isVerified = verified === 'true';
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === SORT_ORDERS.DESC ? -1 : 1;

  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get laborers with pagination
  const laborers = await laborerService.getLaborers(filter, sort, skip, parseInt(limit));

  // Get total count for pagination
  const totalLaborers = await laborerService.getLaborerCount(filter);
  const totalPages = Math.ceil(totalLaborers / limit);

  // Get laborer statistics
  const stats = await laborerService.getLaborerStats();

  // Get specialization statistics
  const specializationStats = await laborerService.getSpecializationStats();

  // Log the action
  await AdminLog.createLog({
    adminId: req.admin.id,
    action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
    details: `Viewed laborer list - Page ${page}, Search: ${search}, Status: ${status}`,
    severity: SEVERITY_LEVELS.LOW,
    status: LOG_STATUS.SUCCESS,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId: req.correlationId
  });

  // Set cache control headers to prevent 304 responses for admin data
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'ETag': false
  });

  return successResponse(res, {
    laborers,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalLaborers,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    stats: stats[0] || {
      total: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      verified: 0,
      unverified: 0,
      available: 0,
      unavailable: 0
    },
    specializationStats,
    timestamp: new Date().toISOString() // Add timestamp to ensure uniqueness
  });
});

// @desc    Get single laborer details
// @route   GET /api/admin/laborers/:id
// @access  Admin only
export const getLaborerDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const laborer = await laborerService.getLaborerById(id);

  if (!laborer) {
    return errorResponse(res, 'Laborer not found', 404);
  }

  // Get laborer activity (recent jobs, reviews, etc.)
  // This would be expanded based on your actual models
  const laborerActivity = {
    totalJobsCompleted: 0, // Would come from Job model
    totalReviews: 0,       // Would come from Review model
    averageRating: laborer.rating || 0,
    lastLogin: laborer.lastLogin,
    accountCreated: laborer.createdAt,
    totalEarnings: 0 // Would come from payment/transaction model
  };

  // Log the action
  await AdminLog.createLog({
    adminId: req.admin.id,
    action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
    details: `Viewed laborer details - ${laborer.email}`,
    severity: SEVERITY_LEVELS.LOW,
    status: LOG_STATUS.SUCCESS,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId: req.correlationId
  });

  return successResponse(res, {
    laborer: { ...laborer, activity: laborerActivity }
  });
});

// @desc    Update laborer status
// @route   PUT /api/admin/laborers/:id/status
// @access  Admin only
export const updateLaborerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  
  if (!Object.values(LABORER_STATUSES).includes(status)) {
    return errorResponse(res, 'Invalid status', 400);
  }

  try {
    const { laborer, oldStatus } = await laborerService.updateLaborerStatus(id, status, reason);

    // Notify other admins
    await notificationQueue.add('admin-notification', {
      subject: 'Laborer Status Updated',
      message: `Admin ${req.admin.name} updated laborer ${laborer.email} status from ${oldStatus} to ${status}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id,
      correlationId: req.correlationId
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Updated laborer status - ${laborer.email}: ${oldStatus} → ${status}`,
      severity: SEVERITY_LEVELS.MEDIUM,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { oldStatus, newStatus: status, reason },
      correlationId: req.correlationId
    });

    return successResponse(res, {
      message: 'Laborer status updated successfully',
      laborer: {
        id: laborer._id,
        email: laborer.email,
        name: laborer.name,
        status: laborer.status,
        statusReason: laborer.statusReason
      }
    });
  } catch (error) {
    logger.error({
      message: 'Error updating laborer status',
      error: error.message,
      stack: error.stack,
      laborerId: id,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to update laborer status', 500);
  }
});

// @desc    Verify/Unverify laborer
// @route   PUT /api/admin/laborers/:id/verify
// @access  Admin only
export const updateLaborerVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isVerified, reason } = req.body;
  
  try {
    const { laborer, oldVerification } = await laborerService.updateLaborerVerification(id, isVerified, reason);

    // Notify other admins
    await notifyAdmins({
      subject: 'Laborer Verification Updated',
      message: `Admin ${req.admin.name} ${isVerified ? 'verified' : 'unverified'} laborer ${laborer.email}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id,
      correlationId: req.correlationId
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Updated laborer verification - ${laborer.email}: ${oldVerification} → ${isVerified}`,
      severity: SEVERITY_LEVELS.MEDIUM,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { oldVerification, newVerification: isVerified, reason },
      correlationId: req.correlationId
    });

    return successResponse(res, {
      message: `Laborer ${isVerified ? 'verified' : 'unverified'} successfully`,
      laborer: {
        id: laborer._id,
        email: laborer.email,
        name: laborer.name,
        isVerified: laborer.isVerified,
        verificationReason: laborer.verificationReason
      }
    });
  } catch (error) {
    logger.error({
      message: 'Error updating laborer verification',
      error: error.message,
      stack: error.stack,
      laborerId: id,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to update laborer verification', 500);
  }
});

// @desc    Delete laborer
// @route   DELETE /api/admin/laborers/:id
// @access  Admin only
export const deleteLaborer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const laborer = await laborerService.softDeleteLaborer(id, req.admin.id);

    // Notify other admins
    await notifyAdmins({
      subject: 'Laborer Deleted',
      message: `Admin ${req.admin.name} deleted laborer ${laborer.email}`,
      excludeAdminId: req.admin.id,
      correlationId: req.correlationId
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Deleted laborer - ${laborer.email}`,
      severity: SEVERITY_LEVELS.HIGH,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId
    });

    return successResponse(res, {
      message: 'Laborer deleted successfully'
    });
  } catch (error) {
    logger.error({
      message: 'Error deleting laborer',
      error: error.message,
      stack: error.stack,
      laborerId: id,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to delete laborer', 500);
  }
});

// @desc    Get laborer statistics
// @route   GET /api/admin/laborers/stats
// @access  Admin only
export const getLaborerStats = asyncHandler(async (req, res) => {
  try {
    // Get basic stats
    const stats = await laborerService.getLaborerStats();

    // Get monthly registrations for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Laborer.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get specialization distribution
    const specializationStats = await laborerService.getSpecializationStats();

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: 'Viewed laborer statistics',
      severity: SEVERITY_LEVELS.LOW,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId
    });

    return successResponse(res, {
      overallStats: stats[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        verified: 0,
        unverified: 0,
        available: 0,
        unavailable: 0
      },
      monthlyStats,
      specializationStats
    });
  } catch (error) {
    logger.error({
      message: 'Error getting laborer statistics',
      error: error.message,
      stack: error.stack,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to get laborer statistics', 500);
  }
});

// @desc    Bulk update laborer statuses
// @route   PUT /api/admin/laborers/bulk-status
// @access  Admin only
export const bulkUpdateLaborerStatus = asyncHandler(async (req, res) => {
  const { laborerIds, status, reason } = req.body;

  if (!Object.values(LABORER_STATUSES).includes(status)) {
    return errorResponse(res, 'Invalid status', 400);
  }

  if (!laborerIds || !Array.isArray(laborerIds) || laborerIds.length === 0) {
    return errorResponse(res, 'Invalid laborer IDs', 400);
  }

  try {
    const { updatedCount } = await laborerService.bulkUpdateLaborerStatus(laborerIds, status, reason, req.admin.id);

    // Notify other admins
    await notificationQueue.add('admin-notification', {
      subject: 'Bulk Laborer Status Update',
      message: `Admin ${req.admin.name} updated status for ${updatedCount} laborers to ${status}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id,
      correlationId: req.correlationId
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Bulk updated ${updatedCount} laborers to status ${status}`,
      severity: SEVERITY_LEVELS.HIGH,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { laborerIds, status, reason },
      correlationId: req.correlationId
    });

    return successResponse(res, {
      message: `Successfully updated ${updatedCount} laborers`,
      updatedCount
    });
  } catch (error) {
    logger.error({
      message: 'Error in bulk laborer status update',
      error: error.message,
      stack: error.stack,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });

    // Log the failed action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: 'Failed bulk laborer status update',
      severity: SEVERITY_LEVELS.HIGH,
      status: LOG_STATUS.FAILED,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { error: error.message },
      correlationId: req.correlationId
    });

    return errorResponse(res, 'Failed to update laborer statuses', 500);
  }
});

// @desc    Export laborer data
// @route   GET /api/admin/laborers/export
// @access  Admin only
export const exportLaborerData = asyncHandler(async (req, res) => {
  const { format = 'csv', specialization = '', status = '', verified = '', rating = '' } = req.query;

  // Build filter
  const filter = { isDeleted: { $ne: true } };
  
  if (specialization) {
    filter.specialization = specialization;
  }
  
  if (status) {
    filter.status = status;
  }
  
  if (verified !== '') {
    filter.isVerified = verified === 'true';
  }
  
  if (rating) {
    filter.rating = { $gte: parseFloat(rating) };
  }

  try {
    // Log the export action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Exported laborer data - Format: ${format}, Filters: ${JSON.stringify({ specialization, status, verified, rating })}`,
      severity: SEVERITY_LEVELS.MEDIUM,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId
    });

    if (format === 'csv') {
      // Define fields to export
      const fields = [
        'name',
        'email',
        'phone',
        'specialization',
        'status',
        'isVerified',
        'rating',
        'isAvailable',
        'location',
        'createdAt',
        'lastLogin'
      ];
      
      // Stream CSV response
      await laborerService.streamLaborersExport(res, filter, fields, req.correlationId);
    } else if (format === 'json') {
      // For JSON format, use pagination to avoid memory issues
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const skip = (page - 1) * limit;
      
      const laborers = await Laborer.find(filter)
        .select('-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .lean();
      
      const totalLaborers = await Laborer.countDocuments(filter);
      const totalPages = Math.ceil(totalLaborers / limit);
      
      return successResponse(res, {
        laborers,
        pagination: {
          currentPage: page,
          totalPages,
          totalLaborers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } else {
      return errorResponse(res, 'Unsupported export format', 400);
    }
  } catch (error) {
    logger.error({
      message: 'Error exporting laborer data',
      error: error.message,
      stack: error.stack,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      return errorResponse(res, 'Failed to export laborer data', 500);
    }
  }
});

// @desc    Get specializations list
// @route   GET /api/admin/laborers/specializations
// @access  Admin only
export const getSpecializations = asyncHandler(async (req, res) => {
  try {
    const specializations = await Laborer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$specialization' } },
      { $sort: { _id: 1 } }
    ]);
    
    return successResponse(res, {
      specializations: specializations.map(s => s._id).filter(Boolean)
    });
  } catch (error) {
    logger.error({
      message: 'Error getting specializations',
      error: error.message,
      stack: error.stack,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to get specializations', 500);
  }
});

// @desc    Get laborer complaints
// @route   GET /api/admin/laborers/:id/complaints
// @access  Admin only
export const getLaborerComplaints = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, status = '' } = req.query;
  
  try {
    // Check if laborer exists
    const laborer = await Laborer.findById(id).select('name email');
    
    if (!laborer) {
      return errorResponse(res, 'Laborer not found', 404);
    }
    
    // Build filter
    const filter = { laborerId: id };
    
    if (status) {
      filter.status = status;
    }
    
    // Import Complaint model dynamically
    const Complaint = (await import('../models/Complaint.js')).default;
    
    // Get complaints with pagination
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .lean();
    
    // Get total count
    const totalComplaints = await Complaint.countDocuments(filter);
    const totalPages = Math.ceil(totalComplaints / limit);
    
    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Viewed complaints for laborer ${laborer.email}`,
      severity: SEVERITY_LEVELS.LOW,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId
    });
    
    return successResponse(res, {
      laborer: {
        id: laborer._id,
        name: laborer.name,
        email: laborer.email
      },
      complaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalComplaints,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    logger.error({
      message: 'Error getting laborer complaints',
      error: error.message,
      stack: error.stack,
      laborerId: id,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to get laborer complaints', 500);
  }
});

// @desc    Update complaint status
// @route   PUT /api/admin/laborers/:id/complaints/:complaintId
// @access  Admin only
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id, complaintId } = req.params;
  const { status, resolution } = req.body;
  
  try {
    // Check if laborer exists
    const laborer = await Laborer.findById(id).select('name email');
    
    if (!laborer) {
      return errorResponse(res, 'Laborer not found', 404);
    }
    
    // Import Complaint model dynamically
    const Complaint = (await import('../models/Complaint.js')).default;
    
    // Find and update complaint
    const complaint = await Complaint.findOneAndUpdate(
      { _id: complaintId, laborerId: id },
      { 
        status,
        resolution,
        resolvedBy: req.admin.id,
        resolvedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!complaint) {
      return errorResponse(res, 'Complaint not found', 404);
    }
    
    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Updated complaint status for laborer ${laborer.email} - Status: ${status}`,
      severity: SEVERITY_LEVELS.MEDIUM,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { complaintId, oldStatus: complaint.status, newStatus: status },
      correlationId: req.correlationId
    });
    
    // Notify user who filed the complaint
    if (complaint.userId) {
      await notificationQueue.add('user-notification', {
        subject: 'Complaint Update',
        message: `Your complaint against ${laborer.name} has been updated to ${status}. ${resolution ? `Resolution: ${resolution}` : ''}`,
        userId: complaint.userId._id,
        correlationId: req.correlationId
      });
    }
    
    return successResponse(res, {
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    logger.error({
      message: 'Error updating complaint status',
      error: error.message,
      stack: error.stack,
      laborerId: id,
      complaintId,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to update complaint status', 500);
  }
});

// @desc    Send warning to laborer
// @route   POST /api/admin/laborers/:id/warning
// @access  Admin only
export const sendWarning = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, message, severity } = req.body;
  
  try {
    // Check if laborer exists
    const laborer = await Laborer.findById(id);
    
    if (!laborer) {
      return errorResponse(res, 'Laborer not found', 404);
    }
    
    // Create warning record
    const Warning = (await import('../models/Warning.js')).default;
    
    const warning = await Warning.create({
      laborerId: id,
      adminId: req.admin.id,
      subject,
      message,
      severity: severity || 'MEDIUM'
    });
    
    // Send notification to laborer
    await notificationQueue.add('laborer-notification', {
      subject: `WARNING: ${subject}`,
      message,
      laborerId: id,
      correlationId: req.correlationId
    });
    
    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Sent warning to laborer ${laborer.email} - ${subject}`,
      severity: SEVERITY_LEVELS.HIGH,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { warningSeverity: severity, subject },
      correlationId: req.correlationId
    });
    
    return successResponse(res, {
      message: 'Warning sent successfully',
      warning
    });
  } catch (error) {
    logger.error({
      message: 'Error sending warning to laborer',
      error: error.message,
      stack: error.stack,
      laborerId: id,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to send warning', 500);
  }
});

// @desc    Suspend laborer
// @route   POST /api/admin/laborers/:id/suspend
// @access  Admin only
export const suspendLaborer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, duration } = req.body;
  
  try {
    // Check if laborer exists
    const laborer = await Laborer.findById(id);
    
    if (!laborer) {
      return errorResponse(res, 'Laborer not found', 404);
    }
    
    // Calculate suspension end date
    const suspensionDays = parseInt(duration) || 7; // Default 7 days
    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + suspensionDays);
    
    // Update laborer status
    laborer.status = LABORER_STATUSES.SUSPENDED;
    laborer.statusReason = reason || 'Suspended by admin';
    laborer.suspendedUntil = suspendedUntil;
    laborer.suspendedBy = req.admin.id;
    laborer.suspendedAt = new Date();
    
    await laborer.save();
    
    // Send notification to laborer
    await notificationQueue.add('laborer-notification', {
      subject: 'Account Suspended',
      message: `Your account has been suspended until ${suspendedUntil.toISOString().split('T')[0]}. Reason: ${reason || 'Violation of terms of service'}`,
      laborerId: id,
      correlationId: req.correlationId
    });
    
    // Notify other admins
    await notificationQueue.add('admin-notification', {
      subject: 'Laborer Suspended',
      message: `Admin ${req.admin.name} suspended laborer ${laborer.email} for ${suspensionDays} days. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Suspended laborer ${laborer.email} for ${suspensionDays} days`,
      severity: SEVERITY_LEVELS.HIGH,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { reason, suspensionDays, suspendedUntil },
      correlationId: req.correlationId
    });
    
    return successResponse(res, {
      message: 'Laborer suspended successfully',
      laborer: {
        id: laborer._id,
        email: laborer.email,
        name: laborer.name,
        status: laborer.status,
        suspendedUntil,
        statusReason: laborer.statusReason
      }
    });
  } catch (error) {
    logger.error({
      message: 'Error suspending laborer',
      error: error.message,
      stack: error.stack,
      laborerId: id,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to suspend laborer', 500);
  }
});

// @desc    Unsuspend laborer
// @route   POST /api/admin/laborers/:id/unsuspend
// @access  Admin only
export const unsuspendLaborer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  try {
    // Check if laborer exists
    const laborer = await Laborer.findById(id);
    
    if (!laborer) {
      return errorResponse(res, 'Laborer not found', 404);
    }
    
    // Check if laborer is suspended
    if (laborer.status !== LABORER_STATUSES.SUSPENDED) {
      return errorResponse(res, 'Laborer is not suspended', 400);
    }
    
    // Update laborer status
    laborer.status = LABORER_STATUSES.ACTIVE;
    laborer.statusReason = reason || 'Unsuspended by admin';
    laborer.suspendedUntil = null;
    
    await laborer.save();
    
    // Send notification to laborer
    await notificationQueue.add('laborer-notification', {
      subject: 'Account Unsuspended',
      message: `Your account has been unsuspended and is now active. ${reason ? `Reason: ${reason}` : ''}`,
      laborerId: id,
      correlationId: req.correlationId
    });
    
    // Notify other admins
    await notificationQueue.add('admin-notification', {
      subject: 'Laborer Unsuspended',
      message: `Admin ${req.admin.name} unsuspended laborer ${laborer.email}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Unsuspended laborer ${laborer.email}`,
      severity: SEVERITY_LEVELS.MEDIUM,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { reason },
      correlationId: req.correlationId
    });
    
    return successResponse(res, {
      message: 'Laborer unsuspended successfully',
      laborer: {
        id: laborer._id,
        email: laborer.email,
        name: laborer.name,
        status: laborer.status,
        statusReason: laborer.statusReason
      }
    });
  } catch (error) {
    logger.error({
      message: 'Error unsuspending laborer',
      error: error.message,
      stack: error.stack,
      laborerId: id,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to unsuspend laborer', 500);
  }
});

// @desc    Send notification to laborers
// @route   POST /api/admin/laborers/notify
// @access  Admin only
export const sendNotificationToLaborers = asyncHandler(async (req, res) => {
  const { subject, message, laborerIds, filter } = req.body;
  
  if (!subject || !message) {
    return errorResponse(res, 'Subject and message are required', 400);
  }
  
  try {
    let targetLaborers = [];
    
    // If specific laborer IDs are provided
    if (laborerIds && Array.isArray(laborerIds) && laborerIds.length > 0) {
      targetLaborers = await Laborer.find({ 
        _id: { $in: laborerIds },
        isDeleted: { $ne: true }
      }).select('_id name email').lean();
    } 
    // If filter criteria are provided
    else if (filter) {
      const queryFilter = { isDeleted: { $ne: true }, ...filter };
      targetLaborers = await Laborer.find(queryFilter)
        .select('_id name email')
        .lean();
    } 
    // No target specified
    else {
      return errorResponse(res, 'Either laborerIds or filter must be provided', 400);
    }
    
    if (targetLaborers.length === 0) {
      return errorResponse(res, 'No laborers found matching the criteria', 404);
    }
    
    // Add notification jobs to queue
    const notificationJobs = targetLaborers.map(laborer => ({
      subject,
      message,
      laborerId: laborer._id,
      correlationId: req.correlationId
    }));
    
    // Add jobs in batches to avoid overwhelming the queue
    const batchSize = 50;
    for (let i = 0; i < notificationJobs.length; i += batchSize) {
      const batch = notificationJobs.slice(i, i + batchSize);
      await Promise.all(
        batch.map(job => notificationQueue.add('laborer-notification', job))
      );
    }
    
    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Sent notification to ${targetLaborers.length} laborers - ${subject}`,
      severity: SEVERITY_LEVELS.MEDIUM,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { 
        recipientCount: targetLaborers.length,
        subject,
        filter: filter || null,
        specificLaborers: laborerIds ? true : false
      },
      correlationId: req.correlationId
    });
    
    return successResponse(res, {
      message: `Notification queued for ${targetLaborers.length} laborers`,
      recipientCount: targetLaborers.length
    });
  } catch (error) {
    logger.error({
      message: 'Error sending notifications to laborers',
      error: error.message,
      stack: error.stack,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to send notifications', 500);
  }
});

// @desc    Get laborer reviews
// @route   GET /api/admin/laborers/:id/reviews
// @access  Admin only
export const getLaborerReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, status = '' } = req.query;
  
  try {
    // Check if laborer exists
    const laborer = await Laborer.findById(id).select('name email rating');
    
    if (!laborer) {
      return errorResponse(res, 'Laborer not found', 404);
    }
    
    // Build filter
    const filter = { laborerId: id };
    
    if (status) {
      filter.status = status;
    }
    
    // Import Review model dynamically
    const Review = (await import('../models/Review.js')).default;
    
    // Get reviews with pagination
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .lean();
    
    // Get total count
    const totalReviews = await Review.countDocuments(filter);
    const totalPages = Math.ceil(totalReviews / limit);
    
    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Viewed reviews for laborer ${laborer.email}`,
      severity: SEVERITY_LEVELS.LOW,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId
    });
    
    return successResponse(res, {
      laborer: {
        id: laborer._id,
        name: laborer.name,
        email: laborer.email,
        rating: laborer.rating
      },
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    logger.error({
      message: 'Error getting laborer reviews',
      error: error.message,
      stack: error.stack,
      laborerId: id,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to get laborer reviews', 500);
  }
});

// @desc    Moderate portfolio item
// @route   PUT /api/admin/laborers/:id/portfolio/:portfolioId
// @access  Admin only
export const moderatePortfolioItem = asyncHandler(async (req, res) => {
  const { id, portfolioId } = req.params;
  const { status, reason } = req.body;
  
  try {
    // Check if laborer exists
    const laborer = await Laborer.findById(id);
    
    if (!laborer) {
      return errorResponse(res, 'Laborer not found', 404);
    }
    
    // Find portfolio item
    const portfolioItem = laborer.portfolio.id(portfolioId);
    
    if (!portfolioItem) {
      return errorResponse(res, 'Portfolio item not found', 404);
    }
    
    // Update portfolio item
    portfolioItem.status = status;
    portfolioItem.moderationReason = reason;
    portfolioItem.moderatedBy = req.admin.id;
    portfolioItem.moderatedAt = new Date();
    
    await laborer.save();
    
    // Send notification to laborer
    await notificationQueue.add('laborer-notification', {
      subject: 'Portfolio Item Moderation',
      message: `Your portfolio item "${portfolioItem.title}" has been ${status.toLowerCase()}. ${reason ? `Reason: ${reason}` : ''}`,
      laborerId: id,
      correlationId: req.correlationId
    });
    
    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: ADMIN_ACTIONS.LABORER_MANAGEMENT,
      details: `Moderated portfolio item for laborer ${laborer.email} - Status: ${status}`,
      severity: SEVERITY_LEVELS.MEDIUM,
      status: LOG_STATUS.SUCCESS,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { portfolioId, status, reason },
      correlationId: req.correlationId
    });
    
    return successResponse(res, {
      message: 'Portfolio item moderated successfully',
      portfolioItem
    });
  } catch (error) {
    logger.error({
      message: 'Error moderating portfolio item',
      error: error.message,
      stack: error.stack,
      laborerId: id,
      portfolioId,
      adminId: req.admin.id,
      correlationId: req.correlationId
    });
    
    return errorResponse(res, 'Failed to moderate portfolio item', 500);
  }
});
