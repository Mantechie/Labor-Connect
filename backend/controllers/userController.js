import User from '../models/User.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).single('profilePhoto');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/profile-photo
// @access  Private
export const uploadProfilePhoto = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
      const profilePhotoUrl = `/uploads/profiles/${req.file.filename}`;
      
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { profilePhoto: profilePhotoUrl },
        { new: true }
      ).select('-password');

      res.json({
        message: 'Profile photo uploaded successfully',
        profilePhoto: profilePhotoUrl,
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

// @desc    Get user's posted jobs
// @route   GET /api/users/posted-jobs
// @access  Private
export const getPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .select('title description status createdAt budget location');

    res.json({ jobs });
  } catch (error) {
    console.error('getPostedJobs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's hired labor history
// @route   GET /api/users/hired-labor
// @access  Private
export const getHiredLabor = async (req, res) => {
  try {
    // First get jobs posted by this user
    const userJobs = await Job.find({ postedBy: req.user.id }).select('_id title description');
    
    if (userJobs.length === 0) {
      return res.json({ hires: [] });
    }
    
    // Then get applications for those jobs
    const jobIds = userJobs.map(job => job._id);
    const hires = await JobApplication.find({ 
      jobId: { $in: jobIds },
      status: { $in: ['approved', 'completed'] }
    })
    .populate('jobId', 'title description')
    .populate('applicantId', 'name email phone')
    .sort({ appliedAt: -1 });

    const formattedHires = hires.map(hire => ({
      _id: hire._id,
      laborerName: hire.applicantId?.name || 'Unknown',
      jobTitle: hire.jobId?.title || 'Unknown Job',
      status: hire.status,
      hiredAt: hire.appliedAt,
      jobDescription: hire.jobId?.description || ''
    }));

    res.json({ hires: formattedHires });
  } catch (error) {
    console.error('getHiredLabor error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserProfile = async (req, res) => {
  try {
    // Delete user's jobs
    await Job.deleteMany({ postedBy: req.user.id });
    
    // Delete user's job applications
    await JobApplication.deleteMany({ 
      $or: [
        { applicant: req.user.id },
        { jobOwner: req.user.id }
      ]
    });
    
    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
