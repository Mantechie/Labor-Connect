import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Laborer from '../models/Laborer.js';
import Admin from '../models/Admin.js';
import AdminLog from '../models/AdminLog.js';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';

// Helper function to notify admins
const notifyAdmins = async ({ subject, message, excludeAdminId }) => {
  try {
    const admins = await Admin.find({ 
      isActive: true, 
      _id: { $ne: excludeAdminId } 
    });
    
    if (admins.length === 0) {
      // No other admins to notify
      return;
    }
    
    for (const admin of admins) {
      try {
        if (admin.email) {
          await sendEmail({
            to: admin.email,
            subject,
            html: `
              <h2>🔔 Admin Notification</h2>
              <p>${message}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            `
          });
        }
        
        if (admin.phone) {
          await sendSMS({
            to: admin.phone,
            message: `LabourConnect Admin: ${subject} - ${message}`
          });
        }
      } catch (error) {
        console.error(`Error notifying admin ${admin.email}:`, error);
      }
    }
    
    // Notified admins successfully
  } catch (error) {
    console.error('Error in notifyAdmins:', error);
  }
};

// @desc    Get all laborers with pagination and filters
// @route   GET /api/admin/laborers
// @access  Admin only
export const getAllLaborers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', specialization = '', verified = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    
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
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get laborers with pagination
    const laborers = await Laborer.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalLaborers = await Laborer.countDocuments(filter);
    const totalPages = Math.ceil(totalLaborers / limit);

    // Get laborer statistics
    const stats = await Laborer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
          unverified: { $sum: { $cond: ['$isVerified', 0, 1] } },
          available: { $sum: { $cond: ['$isAvailable', 1, 0] } },
          unavailable: { $sum: { $cond: ['$isAvailable', 0, 1] } }
        }
      }
    ]);

    // Get specialization statistics
    const specializationStats = await Laborer.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_MANAGEMENT',
      details: `Viewed laborer list - Page ${page}, Search: ${search}, Status: ${status}`,
      severity: 'LOW',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
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
      specializationStats
    });
  } catch (error) {
    console.error('Error getting laborers:', error);
    res.status(500).json({ message: 'Failed to get laborers' });
  }
};

// @desc    Get single laborer details
// @route   GET /api/admin/laborers/:id
// @access  Admin only
export const getLaborerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laborer = await Laborer.findById(id)
      .select('-password')
      .lean();

    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
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
      action: 'LABORER_MANAGEMENT',
      details: `Viewed laborer details - ${laborer.email}`,
      severity: 'LOW',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      laborer: { ...laborer, activity: laborerActivity }
    });
  } catch (error) {
    console.error('Error getting laborer details:', error);
    res.status(500).json({ message: 'Failed to get laborer details' });
  }
};

// @desc    Update laborer status
// @route   PUT /api/admin/laborers/:id/status
// @access  Admin only
export const updateLaborerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const validStatuses = ['active', 'inactive', 'suspended'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const laborer = await Laborer.findById(id);
    
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }

    const oldStatus = laborer.status;
    laborer.status = status;
    
    if (reason) {
      laborer.statusReason = reason;
    }
    
    await laborer.save();

    // Notify other admins
    await notifyAdmins({
      subject: 'Laborer Status Updated',
      message: `Admin ${req.admin.name} updated laborer ${laborer.email} status from ${oldStatus} to ${status}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_MANAGEMENT',
      details: `Updated laborer status - ${laborer.email}: ${oldStatus} → ${status}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { oldStatus, newStatus: status, reason }
    });

    res.status(200).json({
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
    console.error('Error updating laborer status:', error);
    res.status(500).json({ message: 'Failed to update laborer status' });
  }
};

// @desc    Verify/Unverify laborer
// @route   PUT /api/admin/laborers/:id/verify
// @access  Admin only
export const updateLaborerVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, reason } = req.body;
    
    const laborer = await Laborer.findById(id);
    
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }

    const oldVerification = laborer.isVerified;
    laborer.isVerified = isVerified;
    
    if (reason) {
      laborer.verificationReason = reason;
    }
    
    await laborer.save();

    // Notify other admins
    await notifyAdmins({
      subject: 'Laborer Verification Updated',
      message: `Admin ${req.admin.name} ${isVerified ? 'verified' : 'unverified'} laborer ${laborer.email}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_MANAGEMENT',
      details: `Updated laborer verification - ${laborer.email}: ${oldVerification} → ${isVerified}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { oldVerification, newVerification: isVerified, reason }
    });

    res.status(200).json({
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
    console.error('Error updating laborer verification:', error);
    res.status(500).json({ message: 'Failed to update laborer verification' });
  }
};

// @desc    Delete laborer
// @route   DELETE /api/admin/laborers/:id
// @access  Admin only
export const deleteLaborer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laborer = await Laborer.findById(id);
    
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }

    // Soft delete - mark as deleted instead of actually removing
    laborer.isDeleted = true;
    laborer.deletedAt = new Date();
    laborer.deletedBy = req.admin.id;
    await laborer.save();

    // Notify other admins
    await notifyAdmins({
      subject: 'Laborer Deleted',
      message: `Admin ${req.admin.name} deleted laborer ${laborer.email}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_MANAGEMENT',
      details: `Deleted laborer - ${laborer.email}`,
      severity: 'HIGH',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      message: 'Laborer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting laborer:', error);
    res.status(500).json({ message: 'Failed to delete laborer' });
  }
};

// @desc    Get laborer statistics
// @route   GET /api/admin/laborers/stats
// @access  Admin only
export const getLaborerStats = async (req, res) => {
  try {
    const stats = await Laborer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
          unverified: { $sum: { $cond: ['$isVerified', 0, 1] } },
          available: { $sum: { $cond: ['$isAvailable', 1, 0] } },
          unavailable: { $sum: { $cond: ['$isAvailable', 0, 1] } }
        }
      }
    ]);

    // Get monthly registrations for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Laborer.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
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
    const specializationStats = await Laborer.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_MANAGEMENT',
      details: 'Viewed laborer statistics',
      severity: 'LOW',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
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
      monthlyStats,
      specializationStats
    });
  } catch (error) {
    console.error('Error getting laborer stats:', error);
    res.status(500).json({ message: 'Failed to get laborer statistics' });
  }
};

// @desc    Bulk update laborer status
// @route   PUT /api/admin/laborers/bulk-status
// @access  Admin only
export const bulkUpdateLaborerStatus = async (req, res) => {
  try {
    const { laborerIds, status, reason } = req.body;
    
    if (!laborerIds || !Array.isArray(laborerIds) || laborerIds.length === 0) {
      return res.status(400).json({ message: 'Laborer IDs array is required' });
    }

    const validStatuses = ['active', 'inactive', 'suspended'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { status };
    if (reason) {
      updateData.statusReason = reason;
    }

    const result = await Laborer.updateMany(
      { _id: { $in: laborerIds } },
      updateData
    );

    // Notify other admins
    await notifyAdmins({
      subject: 'Bulk Laborer Status Update',
      message: `Admin ${req.admin.name} updated status of ${result.modifiedCount} laborers to ${status}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_MANAGEMENT',
      details: `Bulk updated ${result.modifiedCount} laborers status to ${status}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { laborerIds, status, reason, modifiedCount: result.modifiedCount }
    });

    res.status(200).json({
      message: `Successfully updated ${result.modifiedCount} laborers`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating laborers:', error);
    res.status(500).json({ message: 'Failed to bulk update laborers' });
  }
};

// @desc    Get specializations list
// @route   GET /api/admin/laborers/specializations
// @access  Admin only
export const getSpecializations = async (req, res) => {
  try {
    const specializations = await Laborer.distinct('specialization');
    
    res.status(200).json({
      specializations: specializations.filter(s => s) // Remove null/empty values
    });
  } catch (error) {
    console.error('Error getting specializations:', error);
    res.status(500).json({ message: 'Failed to get specializations' });
  }
};

// @desc    Get laborer complaints
// @route   GET /api/admin/laborers/:id/complaints
// @access  Admin only
export const getLaborerComplaints = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, severity = '', status = '' } = req.query;

    const laborer = await Laborer.findById(id).populate('complaintsReceived.from', 'name email');
    
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }

    let complaints = laborer.complaintsReceived;

    // Apply filters
    if (severity) {
      complaints = complaints.filter(c => c.severity === severity);
    }
    if (status) {
      complaints = complaints.filter(c => c.status === status);
    }

    // Sort by creation date (newest first)
    complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedComplaints = complaints.slice(skip, skip + parseInt(limit));
    const totalComplaints = complaints.length;
    const totalPages = Math.ceil(totalComplaints / limit);

    // Get complaint statistics
    const complaintStats = {
      total: laborer.complaintsReceived.length,
      pending: laborer.complaintsReceived.filter(c => c.status === 'pending').length,
      investigating: laborer.complaintsReceived.filter(c => c.status === 'investigating').length,
      resolved: laborer.complaintsReceived.filter(c => c.status === 'resolved').length,
      dismissed: laborer.complaintsReceived.filter(c => c.status === 'dismissed').length,
      critical: laborer.complaintsReceived.filter(c => c.severity === 'critical').length,
      high: laborer.complaintsReceived.filter(c => c.severity === 'high').length,
      medium: laborer.complaintsReceived.filter(c => c.severity === 'medium').length,
      low: laborer.complaintsReceived.filter(c => c.severity === 'low').length
    };

    res.status(200).json({
      complaints: paginatedComplaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalComplaints,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: complaintStats
    });
  } catch (error) {
    console.error('Error getting laborer complaints:', error);
    res.status(500).json({ message: 'Failed to get laborer complaints' });
  }
};

// @desc    Update complaint status
// @route   PUT /api/admin/laborers/:id/complaints/:complaintId
// @access  Admin only
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id, complaintId } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid complaint status' });
    }

    const laborer = await Laborer.findById(id);
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }

    const complaint = laborer.complaintsReceived.id(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    if (adminNotes) {
      complaint.adminNotes = adminNotes;
    }
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = req.admin.id;
    }

    await laborer.save();

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'COMPLAINT_MANAGEMENT',
      details: `Updated complaint status from ${oldStatus} to ${status} for laborer ${laborer.user}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { laborerId: id, complaintId, oldStatus, newStatus: status }
    });

    res.status(200).json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Failed to update complaint status' });
  }
};

// @desc    Send warning to laborer
// @route   POST /api/admin/laborers/:id/warning
// @access  Admin only
export const sendWarning = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;

    if (!reason || !details) {
      return res.status(400).json({ message: 'Reason and details are required' });
    }

    const laborer = await Laborer.findById(id).populate('user', 'name email phone');
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }

    // Add warning to laborer
    await laborer.addWarning(req.admin.id, reason, details);

    // Send notification to laborer
    if (laborer.user.email) {
      await sendEmail({
        to: laborer.user.email,
        subject: '⚠️ Warning Notice - LabourConnect',
        html: `
          <h2>⚠️ Warning Notice</h2>
          <p>Dear ${laborer.user.name},</p>
          <p>You have received a warning from the LabourConnect administration.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Details:</strong> ${details}</p>
          <p>Please review our terms of service and ensure compliance to avoid further action.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>LabourConnect Team</p>
        `
      });
    }

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_WARNING',
      details: `Sent warning to laborer ${laborer.user.name} - ${reason}`,
      severity: 'HIGH',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { laborerId: id, reason, details }
    });

    res.status(200).json({
      message: 'Warning sent successfully',
      warning: laborer.warnings[laborer.warnings.length - 1]
    });
  } catch (error) {
    console.error('Error sending warning:', error);
    res.status(500).json({ message: 'Failed to send warning' });
  }
};

// @desc    Suspend laborer account
// @route   POST /api/admin/laborers/:id/suspend
// @access  Admin only
export const suspendLaborer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, endDate } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Suspension reason is required' });
    }

    const laborer = await Laborer.findById(id).populate('user', 'name email phone');
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }

    // Suspend laborer
    await laborer.suspend(req.admin.id, reason, endDate ? new Date(endDate) : null);

    // Send notification to laborer
    if (laborer.user.email) {
      await sendEmail({
        to: laborer.user.email,
        subject: '🚫 Account Suspended - LabourConnect',
        html: `
          <h2>🚫 Account Suspension Notice</h2>
          <p>Dear ${laborer.user.name},</p>
          <p>Your LabourConnect account has been suspended.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          ${endDate ? `<p><strong>Suspension Period:</strong> Until ${new Date(endDate).toLocaleDateString()}</p>` : '<p><strong>Suspension Period:</strong> Indefinite</p>'}
          <p>During this period, you will not be able to access your account or receive job opportunities.</p>
          <p>If you believe this is an error, please contact our support team.</p>
          <p>Best regards,<br>LabourConnect Team</p>
        `
      });
    }

    // Notify other admins
    await notifyAdmins({
      subject: 'Laborer Account Suspended',
      message: `Admin ${req.admin.name} suspended laborer ${laborer.user.name}. Reason: ${reason}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_SUSPENSION',
      details: `Suspended laborer ${laborer.user.name} - ${reason}`,
      severity: 'HIGH',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { laborerId: id, reason, endDate }
    });

    res.status(200).json({
      message: 'Laborer suspended successfully',
      suspension: laborer.suspensions[laborer.suspensions.length - 1]
    });
  } catch (error) {
    console.error('Error suspending laborer:', error);
    res.status(500).json({ message: 'Failed to suspend laborer' });
  }
};

// @desc    Unsuspend laborer account
// @route   POST /api/admin/laborers/:id/unsuspend
// @access  Admin only
export const unsuspendLaborer = async (req, res) => {
  try {
    const { id } = req.params;

    const laborer = await Laborer.findById(id).populate('user', 'name email phone');
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }

    // Unsuspend laborer
    await laborer.unsuspend();

    // Send notification to laborer
    if (laborer.user.email) {
      await sendEmail({
        to: laborer.user.email,
        subject: '✅ Account Reactivated - LabourConnect',
        html: `
          <h2>✅ Account Reactivated</h2>
          <p>Dear ${laborer.user.name},</p>
          <p>Your LabourConnect account has been reactivated.</p>
          <p>You can now access your account and receive job opportunities.</p>
          <p>Please ensure you follow our terms of service to avoid future issues.</p>
          <p>Best regards,<br>LabourConnect Team</p>
        `
      });
    }

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_UNSUSPENSION',
      details: `Unsuspended laborer ${laborer.user.name}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { laborerId: id }
    });

    res.status(200).json({
      message: 'Laborer unsuspended successfully'
    });
  } catch (error) {
    console.error('Error unsuspending laborer:', error);
    res.status(500).json({ message: 'Failed to unsuspend laborer' });
  }
};

// @desc    Send notification to laborer(s)
// @route   POST /api/admin/laborers/notify
// @access  Admin only
export const sendNotificationToLaborers = async (req, res) => {
  try {
    const { laborerIds, specialization, message, subject, type = 'general' } = req.body;

    if (!message || !subject) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    let query = { isDeleted: { $ne: true } };

    // Build query based on filters
    if (laborerIds && laborerIds.length > 0) {
      query._id = { $in: laborerIds };
    } else if (specialization) {
      query.specialization = specialization;
    }

    const laborers = await Laborer.find(query).populate('user', 'name email phone');

    if (laborers.length === 0) {
      return res.status(404).json({ message: 'No laborers found matching criteria' });
    }

    let successCount = 0;
    let failureCount = 0;

    // Send notifications
    for (const laborer of laborers) {
      try {
        // Send email notification
        if (laborer.user.email) {
          await sendEmail({
            to: laborer.user.email,
            subject: `📢 ${subject} - LabourConnect`,
            html: `
              <h2>📢 ${subject}</h2>
              <p>Dear ${laborer.user.name},</p>
              <p>${message}</p>
              <p>Best regards,<br>LabourConnect Team</p>
            `
          });
        }

        // Send SMS notification if phone is available
        if (laborer.user.phone) {
          await sendSMS({
            to: laborer.user.phone,
            message: `LabourConnect: ${subject} - ${message}`
          });
        }

        successCount++;
      } catch (error) {
        console.error(`Error notifying laborer ${laborer.user.name}:`, error);
        failureCount++;
      }
    }

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_NOTIFICATION',
      details: `Sent notification to ${successCount} laborers - ${subject}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { 
        totalLaborers: laborers.length, 
        successCount, 
        failureCount, 
        subject, 
        type,
        specialization: specialization || 'all'
      }
    });

    res.status(200).json({
      message: `Notification sent successfully`,
      totalLaborers: laborers.length,
      successCount,
      failureCount
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ message: 'Failed to send notifications' });
  }
};

// @desc    Export laborer data
// @route   GET /api/admin/laborers/export
// @access  Admin only
export const exportLaborerData = async (req, res) => {
  try {
    const { format = 'csv', specialization = '', status = '', verified = '', rating = '' } = req.query;

    // Build filter
    const filter = { isDeleted: { $ne: true } };
    
    if (specialization) filter.specialization = specialization;
    if (status) filter.status = status;
    if (verified !== '') filter.isVerified = verified === 'true';
    if (rating) filter.rating = { $gte: parseFloat(rating) };

    const laborers = await Laborer.find(filter)
      .populate('user', 'name email phone address createdAt')
      .lean();

    // Prepare export data
    const exportData = laborers.map(laborer => ({
      'Laborer ID': laborer._id,
      'Name': laborer.user?.name || 'N/A',
      'Email': laborer.user?.email || 'N/A',
      'Phone': laborer.user?.phone || 'N/A',
      'Specialization': laborer.specialization,
      'Experience (Years)': laborer.experience,
      'Rating': laborer.rating,
      'Total Reviews': laborer.numReviews,
      'Status': laborer.status,
      'Verified': laborer.isVerified ? 'Yes' : 'No',
      'Available': laborer.isAvailable ? 'Yes' : 'No',
      'Availability': laborer.availability,
      'Total Jobs': laborer.totalJobsCompleted,
      'Total Earnings': laborer.totalEarnings,
      'Complaints': laborer.complaintsReceived?.length || 0,
      'Warnings': laborer.warnings?.length || 0,
      'Registration Date': laborer.createdAt,
      'Last Active': laborer.lastActive,
      'Address': laborer.user?.address || 'N/A'
    }));

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=laborers_${Date.now()}.json`);
      return res.json(exportData);
    }

    // CSV format (default)
    if (exportData.length === 0) {
      return res.status(404).json({ message: 'No data to export' });
    }

    const csvHeaders = Object.keys(exportData[0]).join(',');
    const csvRows = exportData.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=laborers_${Date.now()}.csv`);
    
    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'DATA_EXPORT',
      details: `Exported ${exportData.length} laborer records in ${format.toUpperCase()} format`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { format, recordCount: exportData.length, filters: { specialization, status, verified, rating } }
    });

    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting laborer data:', error);
    res.status(500).json({ message: 'Failed to export laborer data' });
  }
};

// @desc    Get laborer reviews
// @route   GET /api/admin/laborers/:id/reviews
// @access  Admin only
export const getLaborerReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, rating = '', flagged = '' } = req.query;

    // This would depend on your Review model structure
    // For now, I'll provide a basic implementation
    const laborer = await Laborer.findById(id).populate('user', 'name');
    
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }

    // You would need to implement this based on your Review model
    // This is a placeholder implementation
    const reviews = {
      reviews: [],
      pagination: {
        currentPage: parseInt(page),
        totalPages: 0,
        totalReviews: 0,
        hasNextPage: false,
        hasPrevPage: false
      },
      stats: {
        averageRating: laborer.rating,
        totalReviews: laborer.numReviews,
        ratingDistribution: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      }
    };

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error getting laborer reviews:', error);
    res.status(500).json({ message: 'Failed to get laborer reviews' });
  }
};

// @desc    Approve/Reject portfolio item
// @route   PUT /api/admin/laborers/:id/portfolio/:portfolioId
// @access  Admin only
export const moderatePortfolioItem = async (req, res) => {
  try {
    const { id, portfolioId } = req.params;
    const { isApproved, reason } = req.body;

    const laborer = await Laborer.findById(id);
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }

    const portfolioItem = laborer.portfolio.id(portfolioId);
    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    portfolioItem.isApproved = isApproved;
    if (reason) {
      portfolioItem.moderationReason = reason;
    }
    portfolioItem.moderatedBy = req.admin.id;
    portfolioItem.moderatedAt = new Date();

    await laborer.save();

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'PORTFOLIO_MODERATION',
      details: `${isApproved ? 'Approved' : 'Rejected'} portfolio item for laborer ${laborer.user}`,
      severity: 'LOW',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { laborerId: id, portfolioId, isApproved, reason }
    });

    res.status(200).json({
      message: `Portfolio item ${isApproved ? 'approved' : 'rejected'} successfully`,
      portfolioItem
    });
  } catch (error) {
    console.error('Error moderating portfolio item:', error);
    res.status(500).json({ message: 'Failed to moderate portfolio item' });
  }
};

// @desc    Add new laborer
// @route   POST /api/admin/laborers
// @access  Admin only
export const addLaborer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      specialization,
      experience,
      availability,
      rating,
      socialLinks
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and specialization are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user account
    const hashedPassword = await bcrypt.hash('laborer123', 10); // Default password
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'laborer',
      address,
      isActive: true
    });

    const savedUser = await user.save();

    // Create laborer profile
    const laborer = new Laborer({
      user: savedUser._id,
      specialization,
      experience: experience || 0,
      availability: availability || 'offline',
      rating: rating || 0,
      socialLinks: socialLinks || {},
      isVerified: false, // Requires admin verification
      isApproved: false, // Requires admin approval
      status: 'inactive' // Start as inactive until verified
    });

    const savedLaborer = await laborer.save();

    // Populate user data for response
    await savedLaborer.populate('user', 'name email phone address');

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'LABORER_CREATION',
      details: `Added new laborer ${name} (${specialization})`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { laborerId: savedLaborer._id, email, specialization }
    });

    res.status(201).json({
      success: true,
      message: 'Laborer added successfully. Verification required.',
      laborer: savedLaborer
    });

  } catch (error) {
    console.error('Add laborer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add laborer',
      error: error.message
    });
  }
}; 