import User from '../models/User.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import { handleControllerError } from '../middlewares/errorHandler.js';
import { upload } from '../middlewares/uploadMiddleware.js';

// Get job requests for laborer
export const getJobRequests = async (req, res) => {
  try {
    const laborerId = req.user.id;
    
    // Find jobs where this laborer has been requested
    const jobRequests = await JobApplication.find({ 
      laborer: laborerId 
    }).populate('job').populate('client', 'name email phone');
    
    const requests = jobRequests.map(request => ({
      _id: request._id,
      title: request.job.title,
      description: request.job.description,
      budget: request.job.budget,
      location: request.job.location,
      status: request.status,
      clientName: request.client.name,
      createdAt: request.createdAt,
      scheduledDate: request.job.scheduledDate
    }));
    
    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    handleControllerError(error, res, 'fetch job requests');
  }
};

// Accept or reject a job
export const handleJobAction = async (req, res) => {
  try {
    const { jobId, action } = req.params;
    const laborerId = req.user.id;
    
    const jobApplication = await JobApplication.findOne({
      _id: jobId,
      laborer: laborerId
    });
    
    if (!jobApplication) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found'
      });
    }
    
    if (action === 'accept') {
      jobApplication.status = 'accepted';
      jobApplication.acceptedAt = new Date();
    } else if (action === 'reject') {
      jobApplication.status = 'rejected';
      jobApplication.rejectedAt = new Date();
    }
    
    await jobApplication.save();
    
    res.status(200).json({
      success: true,
      message: `Job ${action}ed successfully`
    });
  } catch (error) {
    handleControllerError(error, res, 'process job action');
  }
};

// Update laborer profile
export const updateProfile = async (req, res) => {
  try {
    const laborerId = req.user.id;
    const { skills, specialization, experience, hourlyRate, dailyRate, bio } = req.body;
    
    const updatedLaborer = await User.findByIdAndUpdate(
      laborerId,
      {
        skills: skills || [],
        specialization,
        experience,
        hourlyRate,
        dailyRate,
        bio,
        role: 'laborer'
      },
      { new: true, select: '-password' }
    );
    
    if (!updatedLaborer) {
      return res.status(404).json({
        success: false,
        message: 'Laborer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      laborer: updatedLaborer
    });
  } catch (error) {
    handleControllerError(error, res, 'update profile');
  }
};

// Update availability status
export const updateAvailability = async (req, res) => {
  try {
    const laborerId = req.user.id;
    const { availability } = req.body;
    
    const updatedLaborer = await User.findByIdAndUpdate(
      laborerId,
      { availability },
      { new: true, select: '-password' }
    );
    
    if (!updatedLaborer) {
      return res.status(404).json({
        success: false,
        message: 'Laborer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      laborer: updatedLaborer
    });
  } catch (error) {
    handleControllerError(error, res, 'update availability');
  }
};

// Upload documents
export const uploadDocuments = async (req, res) => {
  try {
    const laborerId = req.user.id;
    const documents = {};
    
    // Process uploaded files
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        if (req.files[key]) {
          if (Array.isArray(req.files[key])) {
            documents[key] = req.files[key].map(file => file.path);
          } else {
            documents[key] = req.files[key].path;
          }
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const updatedLaborer = await User.findByIdAndUpdate(
      laborerId,
      { documentDetails: documents },
      { new: true, select: '-password' }
    );
    
    if (!updatedLaborer) {
      return res.status(404).json({
        success: false,
        message: 'Laborer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      laborer: updatedLaborer
    });
  } catch (error) {
    handleControllerError(error, res, 'upload documents');
  }
};

// Get portfolio
export const getPortfolio = async (req, res) => {
  try {
    const laborerId = req.user.id;
    
    const laborer = await User.findById(laborerId).select('portfolio');
    
    if (!laborer) {
      return res.status(404).json({
        success: false,
        message: 'Laborer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      portfolio: laborer.portfolio || []
    });
  } catch (error) {
    handleControllerError(error, res, 'fetch portfolio');
  }
};

// Add portfolio item
export const addPortfolioItem = async (req, res) => {
  try {
    const laborerId = req.user.id;
    const { title, description, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    const portfolioItem = {
      title,
      description,
      category,
      imageUrl: req.file.path,
      createdAt: new Date()
    };
    
    const updatedLaborer = await User.findByIdAndUpdate(
      laborerId,
      { $push: { portfolio: portfolioItem } },
      { new: true, select: '-password' }
    );
    
    if (!updatedLaborer) {
      return res.status(404).json({
        success: false,
        message: 'Laborer not found'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Portfolio item added successfully',
      item: portfolioItem
    });
  } catch (error) {
    handleControllerError(error, res, 'add portfolio item');
  }
};

// Get earnings
export const getEarnings = async (req, res) => {
  try {
    const laborerId = req.user.id;
    
    // Get completed jobs for this laborer
    const completedJobs = await JobApplication.find({
      laborer: laborerId,
      status: 'completed'
    }).populate('job');
    
    const total = completedJobs.reduce((sum, job) => sum + (job.job.budget || 0), 0);
    
    // Calculate this month's earnings
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthJobs = completedJobs.filter(job => 
      job.completedAt >= thisMonth
    );
    const thisMonthEarnings = thisMonthJobs.reduce((sum, job) => sum + (job.job.budget || 0), 0);
    
    // Calculate this week's earnings
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    thisWeek.setHours(0, 0, 0, 0);
    
    const thisWeekJobs = completedJobs.filter(job => 
      job.completedAt >= thisWeek
    );
    const thisWeekEarnings = thisWeekJobs.reduce((sum, job) => sum + (job.job.budget || 0), 0);
    
    res.status(200).json({
      success: true,
      earnings: {
        total,
        thisMonth: thisMonthEarnings,
        thisWeek: thisWeekEarnings
      }
    });
  } catch (error) {
    handleControllerError(error, res, 'fetch earnings');
  }
};

// Get completed jobs
export const getCompletedJobs = async (req, res) => {
  try {
    const laborerId = req.user.id;
    
    const completedJobs = await JobApplication.find({
      laborer: laborerId,
      status: 'completed'
    }).populate('job').populate('client', 'name');
    
    const jobs = completedJobs.map(job => ({
      _id: job._id,
      title: job.job.title,
      description: job.job.description,
      budget: job.budget,
      location: job.location,
      clientName: job.client.name,
      completedAt: job.completedAt,
      rating: job.rating,
      review: job.review
    }));
    
    res.status(200).json({
      success: true,
      jobs
    });
  } catch (error) {
    handleControllerError(error, res, 'fetch completed jobs');
  }
};

// Browse laborers with pagination, filtering, and sorting
export const browseLaborers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6,
      search = '',
      skill = '',
      location = '',
      minPrice = 0,
      maxPrice = Number.MAX_SAFE_INTEGER,
      rating = 0,
      availability = '',
      sort = 'asc'
    } = req.query;

    const query = { role: 'laborer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
      
      // Only add _id search if it's a valid MongoDB ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(search)) {
        query.$or.push({ _id: search });
      }
    }

    if (skill) {
      query.skills = { $in: [skill] };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.dailyRate = { 
        $gte: Number(minPrice), 
        $lte: Number(maxPrice) !== Number.MAX_SAFE_INTEGER ? Number(maxPrice) : Number.MAX_SAFE_INTEGER 
      };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (availability) {
      query.availability = availability;
    }

    const sortOrder = sort === 'asc' ? 1 : -1;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);
    
    const laborers = await User.find(query)
      .sort({ rating: sortOrder })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-password');

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      },
      laborers
    });
  } catch (error) {
    handleControllerError(error, res, 'browse laborers');
  }
};

// Export the upload middleware from uploadMiddleware.js instead
export { upload };
