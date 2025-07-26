import JobApplication from '../models/JobApplication.js';
import Job from '../models/Job.js';
import Laborer from '../models/Laborer.js';
import { handleControllerError, asyncHandler } from '../utils/errorhandlerutil.js';
import { validatePagination } from '../utils/validationUtils.js';
import { sanitizeString } from '../utils/validationUtils.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/Logger.js';
import { jobApplicationLogger } from '../utils/jobapplicationlogger.js';

// POST /api/applications/apply
export const applyToJob = asyncHandler(async (req, res) => {
  try {
    const { jobId, applicantId } = req.body;
    const message = sanitizeString(req.body.message || '');
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json(formatResponse(false, 'Job not found'));
    }
    
    // Check if laborer exists
    const laborer = await Laborer.findById(applicantId);
    if (!laborer) {
      return res.status(404).json(formatResponse(false, 'Laborer not found'));
    }
    
    // Check if already applied
    const existing = await JobApplication.findOne({ jobId, applicantId });
    if (existing) {
      return res.status(400).json(formatResponse(false, 'You have already applied to this job'));
    }
    
    // Create and save application
    const application = new JobApplication({ jobId, applicantId, message });
    await application.save();
    
    // Log the successful application
    jobApplicationLogger.apply(
      req.user.id, 
      jobId, 
      applicantId, 
      true, 
      { applicationId: application._id }
    );
    
    res.status(201).json(formatResponse(
      true,
      'Application submitted successfully',
      { applicationId: application._id }
    ));
  } catch (err) {
    jobApplicationLogger.apply(
      req.user?.id, 
      req.body.jobId, 
      req.body.applicantId, 
      false, 
      { error: err.message }
    );
    handleControllerError(err, res, 'apply to job', 500);
  }
});

// GET /api/applications (admin, with filters and pagination)
export const getAllApplications = asyncHandler(async (req, res) => {
  try {
    const { status, job, applicant, search, page, limit } = req.query;
    const { page: validPage, limit: validLimit } = validatePagination(page, limit, 50);
    
    // Build filter
    let filter = {};
    if (status) filter.status = status;
    if (job) filter.jobId = job;
    if (applicant) filter.applicantId = applicant;
    
    // Add search functionality at database level
    if (search) {
      // Use aggregation pipeline for text search
      const applications = await JobApplication.aggregate([
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobId',
            foreignField: '_id',
            as: 'jobData'
          }
        },
        {
          $lookup: {
            from: 'laborers',
            localField: 'applicantId',
            foreignField: '_id',
            as: 'applicantData'
          }
        },
        {
          $match: {
            $or: [
              { 'jobData.title': { $regex: search, $options: 'i' } },
              { 'applicantData.name': { $regex: search, $options: 'i' } }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            status: 1,
            message: 1,
            appliedAt: 1,
            jobId: { $arrayElemAt: ['$jobData', 0] },
            applicantId: { $arrayElemAt: ['$applicantData', 0] }
          }
        },
        { $skip: (validPage - 1) * validLimit },
        { $limit: validLimit }
      ]);
      
      // Count total matching documents
      const totalCount = await JobApplication.aggregate([
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobId',
            foreignField: '_id',
            as: 'jobData'
          }
        },
        {
          $lookup: {
            from: 'laborers',
            localField: 'applicantId',
            foreignField: '_id',
            as: 'applicantData'
          }
        },
        {
          $match: {
            $or: [
              { 'jobData.title': { $regex: search, $options: 'i' } },
              { 'applicantData.name': { $regex: search, $options: 'i' } }
            ]
          }
        },
        { $count: 'total' }
      ]);
      
      const total = totalCount.length > 0 ? totalCount[0].total : 0;
      
      // Log the search
      jobApplicationLogger.list(
        req.user.id, 
        { status, job, applicant, search, page, limit }, 
        applications.length,
        { total }
      );
      
      return res.json(formatResponse(
        true,
        'Applications retrieved successfully',
        applications,
        {
          pagination: {
            total,
            page: validPage,
            limit: validLimit,
            pages: Math.ceil(total / validLimit)
          }
        }
      ));
    }
    
    // Regular query with population and pagination
    const total = await JobApplication.countDocuments(filter);
    const applications = await JobApplication.find(filter)
      .populate('jobId', 'title category location')
      .populate('applicantId', 'name specialization')
      .skip((validPage - 1) * validLimit)
      .limit(validLimit)
      .sort({ appliedAt: -1 });
    
    // Log the query
    jobApplicationLogger.list(
      req.user.id, 
      { status, job, applicant, page, limit }, 
      applications.length,
      { total }
    );
    
    res.json(formatResponse(
      true,
      'Applications retrieved successfully',
      applications,
      {
        pagination: {
          total,
          page: validPage,
          limit: validLimit,
          pages: Math.ceil(total / validLimit)
        }
      }
    ));
  } catch (err) {
    logger.error('Failed to fetch applications', { 
      error: err.message,
      userId: req.user?.id,
      query: req.query
    });
    handleControllerError(err, res, 'fetch applications', 500);
  }
});

// GET /api/applications/job/:jobId
export const getApplicationsForJob = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page, limit } = req.query;
    const { page: validPage, limit: validLimit } = validatePagination(page, limit, 50);
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json(formatResponse(false, 'Job not found'));
    }
    
    // Check if user has permission to view applications for this job
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.id) {
      return res.status(403).json(formatResponse(false, 'You do not have permission to view applications for this job'));
    }
    
    // Get total count
    const total = await JobApplication.countDocuments({ jobId });
    
    // Get applications with pagination
    const applications = await JobApplication.find({ jobId })
      .populate('applicantId', 'name specialization')
      .skip((validPage - 1) * validLimit)
      .limit(validLimit)
      .sort({ appliedAt: -1 });
    
    // Log the query
    jobApplicationLogger.list(
      req.user.id, 
      { jobId, page, limit }, 
      applications.length,
      { total }
    );
    
    res.json(formatResponse(
      true,
      'Applications retrieved successfully',
      applications,
      {
        pagination: {
          total,
          page: validPage,
          limit: validLimit,
          pages: Math.ceil(total / validLimit)
        }
      }
    ));
  } catch (err) {
    logger.error('Failed to fetch applications for job', { 
      error: err.message,
      userId: req.user?.id,
      jobId: req.params.jobId
    });
    handleControllerError(err, res, 'fetch applications for job', 500);
  }
});

// PATCH /api/applications/:id/approve
export const approveApplication = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find application
    const application = await JobApplication.findById(id);
    if (!application) {
      return res.status(404).json(formatResponse(false, 'Application not found'));
    }
    
    // Store old status for logging
    const oldStatus = application.status;
    
    // Update application status
    application.status = 'approved';
    await application.save();
    
    // Log the status change
    jobApplicationLogger.statusChange(
      req.user.id,
      id,
      oldStatus,
      'approved',
      { jobId: application.jobId, applicantId: application.applicantId }
    );
    
    // Populate response data
    const populatedApplication = await JobApplication.findById(id)
      .populate('jobId', 'title category location')
      .populate('applicantId', 'name specialization');
    
    res.json(formatResponse(
      true,
      'Application approved successfully',
      populatedApplication
    ));
  } catch (err) {
    logger.error('Failed to approve application', { 
      error: err.message,
      userId: req.user?.id,
      applicationId: req.params.id
    });
    handleControllerError(err, res, 'approve application', 500);
  }
});

// PATCH /api/applications/:id/reject
export const rejectApplication = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find application
    const application = await JobApplication.findById(id);
    if (!application) {
      return res.status(404).json(formatResponse(false, 'Application not found'));
    }
    
    // Store old status for logging
    const oldStatus = application.status;
    
    // Update application status
    application.status = 'rejected';
    await application.save();
    
    // Log the status change
    jobApplicationLogger.statusChange(
      req.user.id,
      id,
      oldStatus,
      'rejected',
      { jobId: application.jobId, applicantId: application.applicantId }
    );
    
    // Populate response data
    const populatedApplication = await JobApplication.findById(id)
      .populate('jobId', 'title category location')
      .populate('applicantId', 'name specialization');
    
    res.json(formatResponse(
      true,
      'Application rejected successfully',
      populatedApplication
    ));
  } catch (err) {
    logger.error('Failed to reject application', { 
      error: err.message,
      userId: req.user?.id,
      applicationId: req.params.id
    });
    handleControllerError(err, res, 'reject application', 500);
  }
});
