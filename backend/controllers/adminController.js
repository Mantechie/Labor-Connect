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
