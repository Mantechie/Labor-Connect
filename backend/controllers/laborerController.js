import User from '../models/User.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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
    
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching job requests:', error);
    res.status(500).json({ message: 'Failed to fetch job requests' });
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
      return res.status(404).json({ message: 'Job application not found' });
    }
    
    if (action === 'accept') {
      jobApplication.status = 'accepted';
      jobApplication.acceptedAt = new Date();
    } else if (action === 'reject') {
      jobApplication.status = 'rejected';
      jobApplication.rejectedAt = new Date();
    }
    
    await jobApplication.save();
    
    res.json({ message: `Job ${action}ed successfully` });
  } catch (error) {
    console.error('Error handling job action:', error);
    res.status(500).json({ message: 'Failed to process job action' });
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
      return res.status(404).json({ message: 'Laborer not found' });
    }
    
    res.json({ laborer: updatedLaborer });
  } catch (error) {
    console.error('Error updating laborer profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
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
      return res.status(404).json({ message: 'Laborer not found' });
    }
    
    res.json({ laborer: updatedLaborer });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Failed to update availability' });
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
    }
    
    const updatedLaborer = await User.findByIdAndUpdate(
      laborerId,
      { documentDetails: documents },
      { new: true, select: '-password' }
    );
    
    if (!updatedLaborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }
    
    res.json({ message: 'Documents uploaded successfully', laborer: updatedLaborer });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ message: 'Failed to upload documents' });
  }
};

// Get portfolio
export const getPortfolio = async (req, res) => {
  try {
    const laborerId = req.user.id;
    
    const laborer = await User.findById(laborerId).select('portfolio');
    
    if (!laborer) {
      return res.status(404).json({ message: 'Laborer not found' });
    }
    
    res.json({ portfolio: laborer.portfolio || [] });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
};

// Add portfolio item
export const addPortfolioItem = async (req, res) => {
  try {
    const laborerId = req.user.id;
    const { title, description, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
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
      return res.status(404).json({ message: 'Laborer not found' });
    }
    
    res.json({ 
      message: 'Portfolio item added successfully',
      item: portfolioItem
    });
  } catch (error) {
    console.error('Error adding portfolio item:', error);
    res.status(500).json({ message: 'Failed to add portfolio item' });
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
    
    res.json({
      earnings: {
        total,
        thisMonth: thisMonthEarnings,
        thisWeek: thisWeekEarnings
      }
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ message: 'Failed to fetch earnings' });
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
    
    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching completed jobs:', error);
    res.status(500).json({ message: 'Failed to fetch completed jobs' });
  }
};

// New controller method to browse laborers with pagination, filtering, and sorting
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
        { name: { $regex: search, $options: 'i' } },
        { _id: search }
      ];
    }

    if (skill) {
      query.skills = { $in: [skill] };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.dailyRate = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (availability) {
      query.availability = availability;
    }

    const sortOrder = sort === 'asc' ? 1 : -1;

    const total = await User.countDocuments(query);
    const laborers = await User.find(query)
      .sort({ rating: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password');

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      laborers
    });
  } catch (error) {
    console.error('Error browsing laborers:', error);
    res.status(500).json({ message: 'Failed to browse laborers' });
  }
};

export { upload };
