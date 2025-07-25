//Express.js controller for an admin dashboard
//opn like approval,deletion,data access
//import Mongoose models for db opn  
import User from '../models/User.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';
import Admin from '../models/Admin.js';
import config from '../config/index.js';
import { statsCache, analyticsCache } from '../utils/cache.js';
import { getAdminStatsService, getUsersService } from '../services/adminService.js';
import { handleControllerError } from '../utils/errorhandlerutil.js';
import { Parser } from 'json2csv';
import { Readable } from 'stream';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin only
export const getAdminStats = async (req, res) => {
  try {
    // Get all stats in a single aggregation pipeline
    const statsResults = await User.aggregate([
      {
        $facet: {
          // Total users (excluding admins)
          totalUsers: [
            { $match: { role: 'user' } },
            { $count: 'count' }
          ],
          // Verified laborers
          verifiedLaborers: [
            { $match: { role: 'laborer', isVerified: true } },
            { $count: 'count' }
          ],
          // Pending verification requests
          pendingRequests: [
            { $match: { role: 'laborer', isVerified: false } },
            { $count: 'count' }
          ],
          // Active laborers
          activeLaborers: [
            { $match: { role: 'laborer', availability: 'available' } },
            { $count: 'count' }
          ],
          // Inactive laborers
          inactiveLaborers: [
            { $match: { role: 'laborer', availability: { $ne: 'available' } } },
            { $count: 'count' }
          ],
          // Average rating calculation
          avgRating: [
            { $match: { role: 'laborer', rating: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: '$rating' } } }
          ]
        }
      }
    ]);

    // Get total job posts in a separate query (different collection)
    const totalJobPosts = await Job.countDocuments();
    
    // Extract values from aggregation results
    const stats = {
      totalUsers: statsResults[0].totalUsers[0]?.count || 0,
      verifiedLaborers: statsResults[0].verifiedLaborers[0]?.count || 0,
      pendingRequests: statsResults[0].pendingRequests[0]?.count || 0,
      activeLaborers: statsResults[0].activeLaborers[0]?.count || 0,
      inactiveLaborers: statsResults[0].inactiveLaborers[0]?.count || 0,
      avgRating: statsResults[0].avgRating[0]?.avg || 0,
      totalJobPosts,
      complaintsReceived: 0 // Mock data to be replaced with actual implementation
    };
    
    // Check cache first
    const cachedStats = statsCache.get('adminStats');
    if (cachedStats) {
      return res.json({ stats: cachedStats, fromCache: true });
    }

    // Store in cache
    statsCache.set('adminStats', stats);
  
    res.json({ stats });
  } catch (error) {
    handleControllerError(error, res, 'fetch admin stats');
  }
};

// @desc    Get recent activity
// @route   GET /api/admin/recent-activity
// @access  Admin only
export const getRecentActivity = async (req, res) => {
  try {
    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');
    
    // Get recent job applications
    const recentApplications = await JobApplication.find()
      .populate('job', 'title')
      .populate('laborer', 'name')
      .populate('client', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Combine and format activities
    const activities = [
      ...recentUsers.map(user => ({
        title: `New ${user.role} registered`,
        description: `${user.name} (${user.email}) joined the platform`,
        userName: user.name,
        status: 'new',
        timestamp: user.createdAt
      })),
      ...recentApplications.map(app => ({
        title: `Job application submitted`,
        description: `${app.laborer?.name} applied for "${app.job?.title}"`,
        userName: app.laborer?.name,
        status: app.status,
        timestamp: app.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
    
    res.json({ activities });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activity' });
  }
};

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Admin only
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = config.pagination.defaultLimit, search = '', role = '', status = '' } = req.query;
    
    // Use service to get users
    const result = await getUsersService({ 
      page, 
      limit: Math.min(parseInt(limit), config.pagination.maxLimit), 
      search, 
      role, 
      status 
    });
    
    res.json(result);
  } catch (error) {
    handleControllerError(error, res, 'fetch users');
  }
};

// Note: getAllLaborers function moved to laborerManagementController.js
// This avoids duplication and uses the dedicated Laborer model

// @desc    Update user status (suspend/activate)
// @route   PUT /api/admin/users/:id/status
// @access  Admin only
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Check if user is an admin (prevent modifying other admins)
    const userToUpdate = await User.findById(id).select('role');
    
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent modifying admin users unless current user is super admin
    if (userToUpdate.role === 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to modify admin users' 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, select: '-password' }
    );
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      user
    });
  } catch (error) {
    handleControllerError(error, res, 'update user status');
  }
};

// @desc    Verify laborer documents
// @route   PUT /api/admin/laborers/:id/verify
// @access  Admin only
export const verifyLaborer = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, verificationNotes } = req.body;
    
    const laborer = await User.findByIdAndUpdate(
      id,
      { 
        isVerified,
        verificationDate: isVerified ? new Date() : null,
        verificationNotes, 
        verifiedBy: isVerified ? req.user.id : null
      },
      { new: true, select: '-password' }
    );
    
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }
    // Send notification to laborer about verification status
    if (laborer.email) {
      const subject = isVerified 
        ? 'Your account has been verified!' 
        : 'Verification update on your account';
        
      const message = isVerified
        ? 'Congratulations! Your account has been verified. You can now accept job offers.'
        : `Your verification status has been updated. ${verificationNotes}`;
        
      await sendEmail({
        to: laborer.email,
        subject,
        text: message,
        html: `<p>Hello ${laborer.name},</p><p>${message}</p>`
      });
    }
    
    res.json({
      success: true,
      message: `Laborer ${isVerified ? 'verified' : 'unverified'} successfully`,
      laborer
    });
  } catch (error) {
    handleControllerError(error, res, 'verify laborer');
  } 
};

// @desc    Get job applications with details
// @route   GET /api/admin/job-applications
// @access  Admin only
export const getJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    
    // Build filter query
    const filter = {};
    if (status) filter.status = status;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get job applications with details
    const applications = await JobApplication.find(filter)
      .populate('job', 'title description budget location')
      .populate('laborer', 'name email specialization rating')
      .populate('client', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await JobApplication.countDocuments(filter);
    
    res.json({
      applications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Failed to fetch job applications' });
  }
};

// @desc    Get system health and metrics
// @route   GET /api/admin/system-health
// @access  Admin only
export const getSystemHealth = async (req, res) => {
  try {
    // Get database stats
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await JobApplication.countDocuments();
    
    // Get recent activity counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });
    
    const newJobsToday = await Job.countDocuments({
      createdAt: { $gte: today }
    });
    
    const newApplicationsToday = await JobApplication.countDocuments({
      createdAt: { $gte: today }
    });
    
    res.json({
      systemHealth: {
        database: {
          totalUsers,
          totalJobs,
          totalApplications
        },
        todayActivity: {
          newUsers: newUsersToday,
          newJobs: newJobsToday,
          newApplications: newApplicationsToday
        },
        status: 'healthy',
        lastChecked: new Date()
      }
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({ message: 'Failed to fetch system health' });
  }
};

// @desc    Get ratings and reviews
// @route   GET /api/admin/ratings
// @access  Admin only
export const getRatingsAndReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating = '', laborer = '' } = req.query;
    
    // Build filter query
    const filter = {};
    if (rating) filter.rating = parseInt(rating);
    if (laborer) {
      filter.laborer = laborer;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get reviews with details
    const reviews = await Review.find(filter)
      .populate('laborer', 'name email specialization')
      .populate('client', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Review.countDocuments(filter);
    
    // Get rating statistics
    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({
      reviews,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      ratingStats
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Failed to fetch ratings' });
  }
};

// @desc    Get documents and verifications
// @route   GET /api/admin/documents
// @access  Admin only
export const getDocumentsAndVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', type = '' } = req.query;
    
    // Build filter query
    const filter = { role: 'laborer' };
    if (status === 'verified') filter.isVerified = true;
    if (status === 'unverified') filter.isVerified = false;
    if (status === 'pending') filter.verificationStatus = 'pending';
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get laborers with document info
    const laborers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    // Get verification statistics
    const verificationStats = await User.aggregate([
      { $match: { role: 'laborer' } },
      {
        $group: {
          _id: '$isVerified',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      laborers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      verificationStats
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

// @desc    Get reports and issues
// @route   GET /api/admin/reports
// @access  Admin only
export const getReportsAndIssues = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', type = '', priority = '' } = req.query;
    
    // Build filter query
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // For now, return mock data since we don't have a Report model
    // You can implement a Report model later
    const mockReports = [
      {
        id: '1',
        type: 'user_complaint',
        title: 'User reported inappropriate behavior',
        description: 'User reported that a laborer was rude during service',
        status: 'pending',
        priority: 'high',
        reportedBy: 'john@example.com',
        reportedUser: 'laborer@example.com',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date()
      },
      {
        id: '2',
        type: 'payment_dispute',
        title: 'Payment dispute between user and laborer',
        description: 'User claims payment was made but laborer denies receiving it',
        status: 'investigating',
        priority: 'medium',
        reportedBy: 'user@example.com',
        reportedUser: 'laborer2@example.com',
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date()
      }
    ];
    
  // Get reports with details
    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email')
      .populate('reportedUser', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Report.countDocuments(filter);
    
    // Get report statistics
    const reportStats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      reports,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      reportStats
    });
  } catch (error) {
    handleControllerError(error, res, 'fetch reports');
  }
};

// @desc    Get notifications
// @route   GET /api/admin/notifications
// @access  Admin only
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, read = '' } = req.query;
    
    // Mock notifications data
    const mockNotifications = [
      {
        id: '1',
        type: 'new_user',
        title: 'New user registration',
        message: 'A new user has registered on the platform',
        read: false,
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        type: 'verification_request',
        title: 'Laborer verification request',
        message: 'A laborer has submitted documents for verification',
        read: false,
        createdAt: new Date(Date.now() - 7200000)
      },
      {
        id: '3',
        type: 'system_alert',
        title: 'System maintenance',
        message: 'Scheduled maintenance will occur tonight at 2 AM',
        read: true,
        createdAt: new Date(Date.now() - 86400000)
      }
    ];
    
    // Filter by read status
    let filteredNotifications = mockNotifications;
    if (read === 'true') {
      filteredNotifications = filteredNotifications.filter(n => n.read);
    } else if (read === 'false') {
      filteredNotifications = filteredNotifications.filter(n => !n.read);
    }
    
    // Pagination
    const total = filteredNotifications.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
    
    res.json({
      notifications: paginatedNotifications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// @desc    Update job application status
// @route   PUT /api/admin/job-applications/:id/status
// @access  Admin only
export const updateJobApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    const application = await JobApplication.findByIdAndUpdate(
      id,
      { 
        status,
        adminNotes,
        adminActionDate: new Date()
      },
      { new: true }
    ).populate('job laborer client');
    
    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    
    res.json({
      message: `Job application ${status} successfully`,
      application
    });
  } catch (error) {
    console.error('Update job application status error:', error);
    res.status(500).json({ message: 'Failed to update job application status' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User deleted successfully',
      deletedUser: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// @desc    Delete job
// @route   DELETE /api/admin/jobs/:id
// @access  Admin only
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findByIdAndDelete(id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Also delete related applications
    await JobApplication.deleteMany({ job: id });
    
    res.json({
      message: 'Job deleted successfully',
      deletedJob: { id: job._id, title: job.title }
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
};

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Admin only
export const getAdminAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Job posting trends
    const jobPostings = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top specializations
    const topSpecializations = await User.aggregate([
      { $match: { role: 'laborer' } },
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Revenue metrics (mock data for now)
    const revenueMetrics = {
      totalRevenue: 150000,
      monthlyRevenue: 25000,
      averageJobValue: 1500,
      topEarningSpecializations: [
        { specialization: 'Electrician', revenue: 45000 },
        { specialization: 'Plumber', revenue: 38000 },
        { specialization: 'Carpenter', revenue: 32000 }
      ]
    };
    
    res.json({
      analytics: {
        userRegistrations,
        jobPostings,
        topSpecializations,
        revenueMetrics,
        period: parseInt(period)
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

// @desc    Send notification
// @route   POST /api/admin/notifications/send
// @access  Admin only
export const sendNotification = async (req, res) => {
  try {
    const { type, title, message, targetUsers = [], targetRoles = [], channels = ['email'] } = req.body;
    
    // Validate input
    if (!title || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and message are required' 
      });
    }
    
    if (targetUsers.length === 0 && targetRoles.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'At least one target user or role must be specified' 
      });
    }
    
    // Find users to notify
    const query = {
      $or: []
    };
    
    if (targetUsers.length > 0) {
      query.$or.push({ _id: { $in: targetUsers } });
    }
    
    if (targetRoles.length > 0) {
      query.$or.push({ role: { $in: targetRoles } });
    }
    
    const usersToNotify = await User.find(query)
      .select('name email phone role');
    
    if (usersToNotify.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found matching the specified criteria'
      });
    }
    
    // Send notifications through selected channels
    const notificationPromises = [];
    
    for (const user of usersToNotify) {
      // Send email notifications
      if (channels.includes('email') && user.email) {
        notificationPromises.push(
          sendEmail({
            to: user.email,
            subject: title,
            text: message,
            html: `<p>Hello ${user.name},</p><p>${message}</p>`
          })
        );
      }
      
      // Send SMS notifications
      if (channels.includes('sms') && user.phone) {
        notificationPromises.push(
          sendSMS({
            to: user.phone,
            message: `${title}: ${message}`
          })
        );
      }
    }
    
    // Wait for all notifications to be sent
    const results = await Promise.allSettled(notificationPromises);
    
    // Count successful and failed notifications
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    res.json({
      success: true,
      message: `Notifications sent to ${usersToNotify.length} users`,
      stats: {
        total: usersToNotify.length,
        successful,
        failed
      }
    });
  } catch (error) {
    handleControllerError(error, res, 'send notifications');
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/system/settings
// @access  Admin only
export const updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    // Mock settings update
    // In a real implementation, you would save to database or config file
    
    const updatedSettings = {
      maintenanceMode: settings.maintenanceMode || false,
      registrationEnabled: settings.registrationEnabled || true,
      maxJobApplications: settings.maxJobApplications || 10,
      autoVerifyLaborers: settings.autoVerifyLaborers || false,
      emailNotifications: settings.emailNotifications || true,
      smsNotifications: settings.smsNotifications || false,
      updatedAt: new Date()
    };
    
    res.json({
      message: 'System settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ message: 'Failed to update system settings' });
  }
};

// @desc    Get admin logs
// @route   GET /api/admin/logs
// @access  Admin only
export const getAdminLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, level = '', admin = '' } = req.query;
    
    // Mock admin logs
    const mockLogs = [
      {
        id: '1',
        level: 'info',
        message: 'Admin login successful',
        admin: 'admin@labourconnect.com',
        timestamp: new Date(Date.now() - 3600000),
        details: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' }
      },
      {
        id: '2',
        level: 'warning',
        message: 'Failed login attempt',
        admin: 'unknown',
        timestamp: new Date(Date.now() - 7200000),
        details: { ip: '192.168.1.2', userAgent: 'Mozilla/5.0...' }
      },
      {
        id: '3',
        level: 'error',
        message: 'Database connection timeout',
        admin: 'system',
        timestamp: new Date(Date.now() - 86400000),
        details: { error: 'Connection timeout after 30 seconds' }
      }
    ];
    
    // Filter logs
    let filteredLogs = mockLogs;
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    if (admin) {
      filteredLogs = filteredLogs.filter(log => log.admin.includes(admin));
    }
    
    // Pagination
    const total = filteredLogs.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    res.json({
      logs: paginatedLogs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ message: 'Failed to fetch admin logs' });
  }
};

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Admin only
export const exportData = async (req, res) => {
try {
    const { type } = req.params;
    const { format = 'json' } = req.query;
    
    let query;
    let fields;
    
    // Set up query and fields based on export type
    switch (type) {
      case 'users':
        query = User.find().select('-password');
        fields = ['_id', 'name', 'email', 'role', 'isActive', 'createdAt'];
        break;
      case 'laborers':
        query = User.find({ role: 'laborer' }).select('-password');
        fields = ['_id', 'name', 'email', 'specialization', 'rating', 'isVerified', 'createdAt'];
        break;
      case 'jobs':
        query = Job.find();
        fields = ['_id', 'title', 'description', 'budget', 'location', 'status', 'createdAt'];
        break;
      case 'applications':
        query = JobApplication.find()
          .populate('job', 'title')
          .populate('laborer', 'name')
          .populate('client', 'name');
        fields = ['_id', 'job.title', 'laborer.name', 'client.name', 'status', 'createdAt'];
        break;
      case 'reviews':
        query = Review.find()
          .populate('laborer', 'name')
          .populate('client', 'name')
          .populate('job', 'title');
        fields = ['_id', 'laborer.name', 'client.name', 'job.title', 'rating', 'comment', 'createdAt'];
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }
    
    if (format === 'csv') {
      // Set up CSV response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-${Date.now()}.csv`);
      
      // Create CSV parser
      const json2csv = new Parser({ fields });
      
      // Create a readable stream from the cursor
      const dataStream = Readable.from(query.cursor().map(doc => {
        // Flatten nested objects for CSV
        const flattenedDoc = {};
        fields.forEach(field => {
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            flattenedDoc[field] = doc[parent] ? doc[parent][child] : null;
          } else {
            flattenedDoc[field] = doc[field];
          }
        });
        return flattenedDoc;
      }));
      
      // Stream the data through the CSV parser and to the response
      dataStream.pipe(json2csv).pipe(res);
    } else {
      // For JSON format, use pagination to avoid memory issues
      const { page = 1, limit = 100 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const data = await query
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await query.model.countDocuments(query.getFilter());
      
      res.json({
        message: `${type} data exported successfully`,
        data,
        count: data.length,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        exportedAt: new Date()
      });
    }
  } catch (error) {
    handleControllerError(error, res, 'export data');
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]._doc || data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};
