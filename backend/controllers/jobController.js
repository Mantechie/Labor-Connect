// h:\Labour\backend\controllers\jobController.js
import Job from '../models/Job.js'
import { formatResponse } from '../utils/responseFormatter.js'
import { sanitizeString } from '../utils/validationUtils.js'
import { logger } from '../utils/Logger.js'
import asyncHandler from 'express-async-handler'

// @desc    Post a new job
// @route   POST /api/jobs
export const postJob = asyncHandler(async (req, res) => {
  // extract job details
  const { title, description, location, category, budget, media } = req.body

  // Sanitize text inputs
  const sanitizedTitle = sanitizeString(title)
  const sanitizedDescription = sanitizeString(description)
  const sanitizedLocation = sanitizeString(location)

  // Creates a new Job document with all fields
  const newJob = new Job({
    title: sanitizedTitle,
    description: sanitizedDescription,
    location: sanitizedLocation,
    category,
    postedBy: req.user.id, // Get user ID from auth middleware
    budget,
    media, // array of image URLs 
  })
  
  const savedJob = await newJob.save()
  
  // Log job creation
  logger.info({
    message: 'New job created',
    jobId: savedJob._id,
    userId: req.user.id,
    category
  })
  
  res.status(201).json(formatResponse(
    true, 
    'Job posted successfully', 
    { job: savedJob }
  ))
})

// @desc    Get all job listings with advanced filtering
// @route   GET /api/jobs?page=1&category=plumber&location=mumbai&minBudget=1000&maxBudget=10000
export const getAllJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  // Build filter object
  const filter = {}
  
  // Category filter
  if (req.query.category) {
    filter.category = req.query.category
  }
  
  // Location filter (case-insensitive search)
  if (req.query.location) {
    filter.location = { $regex: sanitizeString(req.query.location), $options: 'i' }
  }
  
  // Budget range filter
  if (req.query.minBudget || req.query.maxBudget) {
    filter.budget = {}
    if (req.query.minBudget) filter.budget.$gte = parseInt(req.query.minBudget)
    if (req.query.maxBudget) filter.budget.$lte = parseInt(req.query.maxBudget)
  }
  
  // Status filter
  if (req.query.status) {
    filter.status = req.query.status
  }
  
  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {}
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate)
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate)
  }

  // Search in title and description
  if (req.query.search) {
    const sanitizedSearch = sanitizeString(req.query.search)
    filter.$or = [
      { title: { $regex: sanitizedSearch, $options: 'i' } },
      { description: { $regex: sanitizedSearch, $options: 'i' } }
    ]
  }

  // Sort options
  let sort = { createdAt: -1 } // Default sort by newest
  if (req.query.sortBy) {
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1
    sort = { [req.query.sortBy]: sortOrder }
  }

  // Use lean() for better performance on read operations
  const jobs = await Job.find(filter)
    .populate('postedBy', 'name email phone')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean()

  const total = await Job.countDocuments(filter)

  // Log search query for analytics
  logger.info({
    message: 'Jobs search performed',
    filters: filter,
    results: total,
    page
  })

  res.status(200).json(formatResponse(
    true,
    'Jobs retrieved successfully',
    {
      jobs,
      page,
      totalPages: Math.ceil(total / limit),
      total
    },
    {
      filters: {
        applied: Object.keys(filter).length > 0 ? filter : null,
        available: {
          categories: ['plumber', 'electrician', 'mason', 'carpenter', 'painter', 'welder', 'other'],
          statuses: ['open', 'in progress', 'completed', 'cancelled']
        }
      }
    }
  ))
})

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('postedBy', 'name email role')
    .lean()
    
  if (!job) {
    res.status(404)
    throw new Error('Job not found')
  }

  res.status(200).json(formatResponse(
    true,
    'Job retrieved successfully',
    { job }
  ))
})

// @desc    Update a job
// @route   PUT /api/jobs/:id
export const updateJob = asyncHandler(async (req, res) => {
  const { title, description, location, category, budget, media } = req.body

  // Sanitize text inputs
  const updateData = {}
  if (title) updateData.title = sanitizeString(title)
  if (description) updateData.description = sanitizeString(description)
  if (location) updateData.location = sanitizeString(location)
  if (category) updateData.category = category
  if (budget) updateData.budget = budget
  if (media) updateData.media = media

  const updatedJob = await Job.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true }
  )

  if (!updatedJob) {
    res.status(404)
    throw new Error('Job not found')
  }

  // Log job update
  logger.info({
    message: 'Job updated',
    jobId: updatedJob._id,
    userId: req.user.id,
    updatedFields: Object.keys(updateData)
  })

  res.status(200).json(formatResponse(
    true,
    'Job updated successfully',
    { job: updatedJob }
  ))
})

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
export const deleteJob = asyncHandler(async (req, res) => {
  const deletedJob = await Job.findByIdAndDelete(req.params.id)
  
  if (!deletedJob) {
    res.status(404)
    throw new Error('Job not found')
  }

  // Log job deletion
  logger.info({
    message: 'Job deleted',
    jobId: req.params.id,
    userId: req.user.id
  })

  res.status(200).json(formatResponse(
    true,
    'Job deleted successfully'
  ))
})
