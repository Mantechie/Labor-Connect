import User from '../models/User.js';
import Admin from '../models/Admin.js';
import AdminLog from '../models/AdminLog.js';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';
import AdminNotificationService from '../services/adminNotificationService.js';

// Helper function to notify admins
const notifyAdmins = async ({ subject, message, excludeAdminId }) => {
  try {
    // Get all active admins except the excluded one
    const admins = await Admin.find({ 
      isActive: true, 
      _id: { $ne: excludeAdminId } 
    });
    
    if (admins.length === 0) {
      console.log('No other admins to notify');
      return;
    }
    
    for (const admin of admins) {
      try {
        // Send email notification
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
        
        // Send SMS notification
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
    
    console.log(`✅ Notified ${admins.length} admins`);
  } catch (error) {
    console.error('Error in notifyAdmins:', error);
  }
};

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Admin only
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    // Get user statistics
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
          unverified: { $sum: { $cond: ['$isVerified', 0, 1] } }
        }
      }
    ]);

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Viewed user list - Page ${page}, Search: ${search}, Status: ${status}`,
      severity: 'LOW',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: stats[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        verified: 0,
        unverified: 0
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Admin only
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user activity (recent jobs, reviews, etc.)
    // This would be expanded based on your actual models
    const userActivity = {
      totalJobsPosted: 0, // Would come from Job model
      totalReviews: 0,    // Would come from Review model
      lastLogin: user.lastLogin,
      accountCreated: user.createdAt
    };

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Viewed user details - ${user.email}`,
      severity: 'LOW',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      user: { ...user, activity: userActivity }
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ message: 'Failed to get user details' });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Admin only
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const validStatuses = ['active', 'inactive', 'suspended'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldStatus = user.status;
    user.status = status;
    
    if (reason) {
      user.statusReason = reason;
    }
    
    await user.save();

    // Notify other admins
    await notifyAdmins({
      subject: 'User Status Updated',
      message: `Admin ${req.admin.name} updated user ${user.email} status from ${oldStatus} to ${status}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Updated user status - ${user.email}: ${oldStatus} → ${status}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { oldStatus, newStatus: status, reason }
    });

    res.status(200).json({
      message: 'User status updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
        statusReason: user.statusReason
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete - mark as deleted instead of actually removing
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deletedBy = req.admin.id;
    await user.save();

    // Notify other admins
    await notifyAdmins({
      subject: 'User Deleted',
      message: `Admin ${req.admin.name} deleted user ${user.email}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Deleted user - ${user.email}`,
      severity: 'HIGH',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Admin only
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
          unverified: { $sum: { $cond: ['$isVerified', 0, 1] } }
        }
      }
    ]);

    // Get monthly registrations for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await User.aggregate([
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

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: 'Viewed user statistics',
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
        unverified: 0
      },
      monthlyStats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Failed to get user statistics' });
  }
};

// @desc    Bulk update user status
// @route   PUT /api/admin/users/bulk-status
// @access  Admin only
export const bulkUpdateUserStatus = async (req, res) => {
  try {
    const { userIds, status, reason } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    const validStatuses = ['active', 'inactive', 'suspended'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { status };
    if (reason) {
      updateData.statusReason = reason;
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    // Notify other admins
    await notifyAdmins({
      subject: 'Bulk User Status Update',
      message: `Admin ${req.admin.name} updated status of ${result.modifiedCount} users to ${status}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Bulk updated ${result.modifiedCount} users status to ${status}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { userIds, status, reason, modifiedCount: result.modifiedCount }
    });

    res.status(200).json({
      message: `Successfully updated ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating users:', error);
    res.status(500).json({ message: 'Failed to bulk update users' });
  }
}; 

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin only
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, reason } = req.body;
    
    const validRoles = ['user', 'laborer', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    
    // Log admin action
    user.adminActions.push({
      adminId: req.admin.id,
      action: 'role_change',
      details: `Role changed from ${oldRole} to ${role}. Reason: ${reason || 'No reason provided'}`
    });
    
    await user.save();

    // Notify other admins
    await notifyAdmins({
      subject: 'User Role Updated',
      message: `Admin ${req.admin.name} updated user ${user.email} role from ${oldRole} to ${role}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Updated user role - ${user.email}: ${oldRole} → ${role}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { oldRole, newRole: role, reason }
    });

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Admin only
export const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked, reason } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wasBlocked = user.status === 'blocked';
    
    if (isBlocked) {
      user.status = 'blocked';
      user.blockedBy = req.admin.id;
      user.blockedAt = new Date();
      user.statusReason = reason;
    } else {
      user.status = 'active';
      user.blockedBy = null;
      user.blockedAt = null;
      user.statusReason = null;
    }
    
    // Log admin action
    user.adminActions.push({
      adminId: req.admin.id,
      action: isBlocked ? 'user_blocked' : 'user_unblocked',
      details: `${isBlocked ? 'Blocked' : 'Unblocked'} user. Reason: ${reason || 'No reason provided'}`
    });
    
    await user.save();

    // Notify other admins
    await notifyAdmins({
      subject: `User ${isBlocked ? 'Blocked' : 'Unblocked'}`,
      message: `Admin ${req.admin.name} ${isBlocked ? 'blocked' : 'unblocked'} user ${user.email}. Reason: ${reason || 'No reason provided'}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `${isBlocked ? 'Blocked' : 'Unblocked'} user - ${user.email}`,
      severity: 'HIGH',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { isBlocked, reason }
    });

    res.status(200).json({
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
        statusReason: user.statusReason
      }
    });
  } catch (error) {
    console.error('Error toggling user block:', error);
    res.status(500).json({ message: 'Failed to toggle user block' });
  }
};

// @desc    Verify user documents
// @route   PUT /api/admin/users/:id/verify-documents
// @access  Admin only
export const verifyUserDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, status, notes } = req.body;
    
    const validDocumentTypes = ['aadhar', 'idProof', 'workLicense'];
    const validStatuses = ['pending', 'approved', 'rejected'];
    
    if (!validDocumentTypes.includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldStatus = user.documentStatus[documentType];
    user.documentStatus[documentType] = status;
    
    if (status === 'approved') {
      user.isVerified = true;
      user.verificationDate = new Date();
      user.verifiedBy = req.admin.id;
      user.verificationNotes = notes;
    }
    
    // Log admin action
    user.adminActions.push({
      adminId: req.admin.id,
      action: 'document_verification',
      details: `${documentType} document ${status}. Notes: ${notes || 'No notes'}`
    });
    
    await user.save();

    // Notify other admins
    await notifyAdmins({
      subject: 'User Document Verification',
      message: `Admin ${req.admin.name} ${status} ${documentType} document for user ${user.email}. Notes: ${notes || 'No notes'}`,
      excludeAdminId: req.admin.id
    });

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Document verification - ${user.email}: ${documentType} ${oldStatus} → ${status}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { documentType, oldStatus, newStatus: status, notes }
    });

    res.status(200).json({
      message: `Document ${status} successfully`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        documentStatus: user.documentStatus,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying user documents:', error);
    res.status(500).json({ message: 'Failed to verify user documents' });
  }
};

// @desc    Get user activity logs
// @route   GET /api/admin/users/:id/activity
// @access  Admin only
export const getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(id)
      .select('activityLogs adminActions')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Combine and sort all activities
    const allActivities = [
      ...user.activityLogs.map(log => ({ ...log, type: 'user' })),
      ...user.adminActions.map(action => ({ ...action, type: 'admin' }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Paginate activities
    const skip = (page - 1) * limit;
    const paginatedActivities = allActivities.slice(skip, skip + parseInt(limit));
    const totalActivities = allActivities.length;
    const totalPages = Math.ceil(totalActivities / limit);

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Viewed user activity - ${user.email}`,
      severity: 'LOW',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      activities: paginatedActivities,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalActivities,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ message: 'Failed to get user activity' });
  }
};

// @desc    Get user complaints
// @route   GET /api/admin/users/:id/complaints
// @access  Admin only
export const getUserComplaints = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('complaintsReceived complaintsFiled')
      .populate('complaintsReceived.from', 'name email')
      .populate('complaintsFiled.against', 'name email')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Viewed user complaints - ${user.email}`,
      severity: 'LOW',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      complaintsReceived: user.complaintsReceived || [],
      complaintsFiled: user.complaintsFiled || []
    });
  } catch (error) {
    console.error('Error getting user complaints:', error);
    res.status(500).json({ message: 'Failed to get user complaints' });
  }
};

// @desc    Update complaint status
// @route   PUT /api/admin/users/:id/complaints/:complaintId
// @access  Admin only
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id, complaintId } = req.params;
    const { status, adminNotes } = req.body;
    
    const validStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find complaint in received complaints
    let complaint = user.complaintsReceived.id(complaintId);
    let complaintType = 'received';
    
    if (!complaint) {
      // Check filed complaints
      complaint = user.complaintsFiled.id(complaintId);
      complaintType = 'filed';
    }
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    
    if (complaintType === 'received') {
      complaint.adminNotes = adminNotes;
      if (status === 'resolved' || status === 'dismissed') {
        complaint.resolvedAt = new Date();
      }
    }
    
    await user.save();

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Updated complaint status - ${user.email}: ${oldStatus} → ${status}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { complaintType, oldStatus, newStatus: status, adminNotes }
    });

    res.status(200).json({
      message: 'Complaint status updated successfully',
      complaint: {
        id: complaint._id,
        status: complaint.status,
        adminNotes: complaint.adminNotes
      }
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Failed to update complaint status' });
  }
};

// @desc    Export users data
// @route   GET /api/admin/users/export
// @access  Admin only
export const exportUsers = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    const users = await User.find({ isDeleted: false })
      .select('name email phone role status isVerified createdAt lastLogin')
      .lean();

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Name,Email,Phone,Role,Status,Verified,Join Date,Last Login\n';
      const csvData = users.map(user => 
        `"${user.name}","${user.email}","${user.phone || ''}","${user.role}","${user.status}","${user.isVerified ? 'Yes' : 'No'}","${user.createdAt}","${user.lastLogin || 'Never'}"`
      ).join('\n');
      
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      res.send(csv);
    } else {
      res.status(400).json({ message: 'Unsupported export format' });
    }

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Exported users data - ${format.toUpperCase()}`,
      severity: 'LOW',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ message: 'Failed to export users' });
  }
};

// @desc    Send notification to users
// @route   POST /api/admin/users/notify
// @access  Admin only
export const sendUserNotification = async (req, res) => {
  try {
    const { userIds, subject, message, type = 'all' } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    let targetUsers = [];
    
    if (type === 'all') {
      targetUsers = await User.find({ isDeleted: false, status: 'active' });
    } else if (type === 'selected' && userIds && userIds.length > 0) {
      targetUsers = await User.find({ _id: { $in: userIds }, isDeleted: false });
    } else {
      return res.status(400).json({ message: 'Invalid notification type or user IDs' });
    }

    // Send notifications (this would integrate with your notification system)
    const notificationResults = [];
    
    for (const user of targetUsers) {
      try {
        // Here you would send email/SMS notifications
        // For now, we'll just log the notification
        notificationResults.push({
          userId: user._id,
          email: user.email,
          success: true
        });
      } catch (error) {
        notificationResults.push({
          userId: user._id,
          email: user.email,
          success: false,
          error: error.message
        });
      }
    }

    // Log the action
    await AdminLog.createLog({
      adminId: req.admin.id,
      action: 'USER_MANAGEMENT',
      details: `Sent notification to ${targetUsers.length} users - ${subject}`,
      severity: 'MEDIUM',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { subject, message, type, targetCount: targetUsers.length }
    });

    res.status(200).json({
      message: `Notification sent to ${targetUsers.length} users`,
      results: notificationResults
    });
  } catch (error) {
    console.error('Error sending user notification:', error);
    res.status(500).json({ message: 'Failed to send notification' });
  }
}; 