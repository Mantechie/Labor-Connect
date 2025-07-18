//Express.js controller for an admin dashboard
//opn like approval,deletion,data access
//import Mongoose models for db opn  
import User from '../models/User.js' //Users
import Job from '../models/Job.js'  //Jobs
import Chat from '../models/chat.js'  //Chats
import Review from '../models/Review.js' //Reviews
// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    //Fetches all users and excludes passwords frm results
    const users = await User.find().select('-password')
    //Sends a 200K responses with user data
    res.status(200).json(users)
  } catch (err) {
    // Catches error & send a 500 Internal Server Error
    res.status(500).json({ message: 'Failed to fetch users', error: err.message })
  }
}

// @desc    Approve laborer (set isApproved = true)
// @route   PUT /api/admin/laborers/:id/approve
export const approveLaborer = async (req, res) => {
  try {
    //Queries the user by ID from URl parameters
    const laborer = await User.findById(req.params.id)
    
    //Validates if the user exists and has "laborer" role
    if (!laborer || laborer.role !== 'laborer') {
      return res.status(404).json({ message: 'Laborer not found' })
    }
    
    // Set isApproved to true
    laborer.isApproved = true
    //Persists the change to db
    await laborer.save()

    res.status(200).json({ message: 'Laborer approved successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error approving laborer', error: err.message })
  }
}

// @desc    Get all registered laborers
// @route   GET /api/admin/laborers
// @access  Private (Admin only)
export const getAllLaborers = async (req, res) => {
  try {
    // fetches only laborers and excludes/hides passwords
    const laborers = await User.find({ role: 'laborer' }).select('-password')
    // return the filtered list
    res.status(200).json(laborers)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch laborers', error: error.message })
  }
}

// @desc    Delete a user (admin right)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    // del a user using ID from the URl
    const deletedUser = await User.findByIdAndDelete(req.params.id)
    // if user doesn't exist
    if (!deletedUser) return res.status(404).json({ message: 'User not found' })
    
    // Success response
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message })
  }
}

// @desc    Get all jobs
// @route   GET /api/admin/jobs
export const getAllJobs = async (req, res) => {
  try {
    // fetches all jobs and replaces postedBy(USer ID) with user's name,email and role
    const jobs = await Job.find().populate('postedBy', 'name email role')
    res.status(200).json(jobs)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message })
  }
}

// @desc    Get all chat histories
// @route   GET /api/admin/chats
// @access  Private (Admin only)
export const getAllChats = async (req, res) => {
  try {
    // Populates sender/receiver IDs with their name & role 
    const chats = await Chat.find({})
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      // Sorts chats by createdAt in desc order
      .sort({ createdAt: -1 })

    res.status(200).json(chats)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chats', error: error.message })
  }
}

// @desc    Get all user-submitted reviews
// @route   GET /api/admin/reviews
// @access  Private (Admin only)
export const getAllReviews = async (req, res) => {
  try {
    // Attach user/laborers names to reviews instead of just IDs
    const reviews = await Review.find({})
      .populate('user', 'name')
      .populate('laborer', 'name')

    res.status(200).json(reviews)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message })
  }
}

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getAnalytics = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments()
    const totalJobs = await Job.countDocuments()
    const totalLaborers = await User.countDocuments({ role: 'laborer' })
    const totalReviews = await Review.countDocuments()
    const totalChats = await Chat.countDocuments()

    // User growth (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    // Job statistics
    const openJobs = await Job.countDocuments({ status: 'open' })
    const completedJobs = await Job.countDocuments({ status: 'completed' })
    const inProgressJobs = await Job.countDocuments({ status: 'in progress' })

    // Laborer statistics
    const availableLaborers = await User.countDocuments({ 
      role: 'laborer', 
      isAvailable: true 
    })
    const approvedLaborers = await User.countDocuments({ 
      role: 'laborer', 
      isApproved: true 
    })

    // Revenue estimation (based on completed jobs)
    const completedJobsData = await Job.find({ status: 'completed' })
    const totalRevenue = completedJobsData.reduce((sum, job) => sum + (job.budget || 0), 0)

    // Category distribution
    const categoryStats = await Job.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Monthly job trends (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
    const monthlyJobTrends = await Job.aggregate([
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
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Top rated laborers
    const topLaborers = await User.find({ 
      role: 'laborer', 
      rating: { $gt: 0 } 
    })
    .sort({ rating: -1 })
    .limit(10)
    .select('name rating numReviews specialization')

    // Recent activity
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('postedBy', 'name email')

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt')

    res.status(200).json({
      overview: {
        totalUsers,
        totalJobs,
        totalLaborers,
        totalReviews,
        totalChats,
        newUsersThisMonth,
        totalRevenue: Math.round(totalRevenue)
      },
      jobs: {
        open: openJobs,
        completed: completedJobs,
        inProgress: inProgressJobs,
        completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
      },
      laborers: {
        total: totalLaborers,
        available: availableLaborers,
        approved: approvedLaborers,
        approvalRate: totalLaborers > 0 ? Math.round((approvedLaborers / totalLaborers) * 100) : 0
      },
      categories: categoryStats,
      trends: {
        monthlyJobs: monthlyJobTrends
      },
      topPerformers: {
        laborers: topLaborers
      },
      recentActivity: {
        jobs: recentJobs,
        users: recentUsers
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message })
  }
}
