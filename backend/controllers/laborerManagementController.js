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