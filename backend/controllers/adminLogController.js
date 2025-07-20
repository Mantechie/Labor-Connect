import AdminLog from '../models/AdminLog.js';
import Admin from '../models/Admin.js';

// @desc    Get admin audit logs with pagination and filters
// @route   GET /api/admin/logs
// @access  Admin only
export const getAdminLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action = '', 
      severity = '', 
      status = '', 
      adminId = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const filters = {};
    if (action) filters.action = action;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (adminId) filters.adminId = adminId;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const result = await AdminLog.getLogs(filters, parseInt(page), parseInt(limit));

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
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
};

// @desc    Get recent admin activity
// @route   GET /api/admin/logs/recent
// @access  Admin only
export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const logs = await AdminLog.getRecentActivity(parseInt(limit));

    res.json({
      logs,
      total: logs.length
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activity' });
  }
};

// @desc    Get security events
// @route   GET /api/admin/logs/security
// @access  Admin only
export const getSecurityEvents = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const events = await AdminLog.getSecurityEvents(parseInt(days));

    res.json({
      events,
      total: events.length,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Get security events error:', error);
    res.status(500).json({ message: 'Failed to fetch security events' });
  }
};

// @desc    Get admin activity summary
// @route   GET /api/admin/logs/summary
// @access  Admin only
export const getActivitySummary = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

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
          adminEmail: '$admin.email',
          actionCount: 1
        }
      }
    ]);

    res.json({
      period: `${days} days`,
      activityCounts,
      severityDistribution,
      statusDistribution,
      topAdmins,
      totalLogs: activityCounts.reduce((sum, item) => sum + item.count, 0)
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({ message: 'Failed to fetch activity summary' });
  }
};

// @desc    Get logged in admins
// @route   GET /api/admin/logs/logged-in
// @access  Admin only
export const getLoggedInAdmins = async (req, res) => {
  try {
    const loggedInAdmins = await Admin.getLoggedInAdmins();

    res.json({
      admins: loggedInAdmins,
      total: loggedInAdmins.length
    });
  } catch (error) {
    console.error('Get logged in admins error:', error);
    res.status(500).json({ message: 'Failed to fetch logged in admins' });
  }
};

// @desc    Force logout all admins
// @route   POST /api/admin/logs/force-logout-all
// @access  Super Admin only
export const forceLogoutAllAdmins = async (req, res) => {
  try {
    const result = await Admin.forceLogoutAll();

    // Log this action
    await AdminLog.createLog({
      adminId: req.admin._id,
      adminEmail: req.admin.email,
      action: 'force_logout_all',
      details: 'All admins force logged out',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'high',
      status: 'success'
    });

    res.json({
      message: 'All admins have been logged out',
      affectedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Force logout all admins error:', error);
    res.status(500).json({ message: 'Failed to force logout all admins' });
  }
};

// @desc    Export logs to CSV
// @route   GET /api/admin/logs/export
// @access  Admin only
export const exportLogs = async (req, res) => {
  try {
    const { startDate = '', endDate = '', action = '' } = req.query;

    const filters = {};
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    if (action) filters.action = action;

    const logs = await AdminLog.find(filters)
      .populate('adminId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(1000); // Limit to prevent memory issues

    // Convert to CSV format
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

    const csvRows = logs.map(log => [
      log.createdAt.toISOString(),
      log.adminId?.name || 'Unknown',
      log.adminId?.email || log.adminEmail,
      log.action,
      log.details || '',
      log.ipAddress || '',
      log.severity,
      log.status
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=admin-logs-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).json({ message: 'Failed to export logs' });
  }
}; 