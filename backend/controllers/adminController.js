//Express.js controller for an admin dashboard
//opn like approval,deletion,data access
//import Mongoose models for db opn  
import User from '../models/User.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin only
export const getAdminStats = async (req, res) => {
  try {
    // Get total users (excluding admins)
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get verified laborers
    const verifiedLaborers = await User.countDocuments({ 
      role: 'laborer', 
      isVerified: true 
    });
    
    // Get pending verification requests
    const pendingRequests = await User.countDocuments({ 
      role: 'laborer', 
      isVerified: false 
    });
    
    // Get total job posts
    const totalJobPosts = await Job.countDocuments();
    
    // Calculate average rating
    const laborersWithRatings = await User.find({ 
      role: 'laborer', 
      rating: { $gt: 0 } 
    });
    
    const avgRating = laborersWithRatings.length > 0 
      ? laborersWithRatings.reduce((sum, laborer) => sum + laborer.rating, 0) / laborersWithRatings.length
      : 0;
    
    // Get active vs inactive laborers
    const activeLaborers = await User.countDocuments({ 
      role: 'laborer', 
      availability: 'available' 
    });
    
    const inactiveLaborers = await User.countDocuments({ 
      role: 'laborer', 
      availability: { $ne: 'available' } 
    });
    
    // Mock complaints count (you can implement a complaints model later)
    const complaintsReceived = 0;
    
    res.json({
      stats: {
        totalUsers,
        verifiedLaborers,
        pendingRequests,
        totalJobPosts,
        avgRating,
        complaintsReceived,
        activeLaborers,
        inactiveLaborers
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
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
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    
    // Build filter query
    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// @desc    Get all laborers with verification status
// @route   GET /api/admin/laborers
// @access  Admin only
export const getAllLaborers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', specialization = '' } = req.query;
    
    // Build filter query
    const filter = { role: 'laborer' };
    if (status === 'verified') filter.isVerified = true;
    if (status === 'unverified') filter.isVerified = false;
    if (status === 'active') filter.availability = 'available';
    if (status === 'inactive') filter.availability = { $ne: 'available' };
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get laborers with pagination
    const laborers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    res.json({
      laborers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get all laborers error:', error);
    res.status(500).json({ message: 'Failed to fetch laborers' });
  }
};

// @desc    Update user status (suspend/activate)
// @route   PUT /api/admin/users/:id/status
// @access  Admin only
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
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
        verificationNotes
      },
      { new: true, select: '-password' }
    );
    
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }
    
    res.json({
      message: `Laborer ${isVerified ? 'verified' : 'unverified'} successfully`,
      laborer
    });
  } catch (error) {
    console.error('Verify laborer error:', error);
    res.status(500).json({ message: 'Failed to verify laborer' });
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
