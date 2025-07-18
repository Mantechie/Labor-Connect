import Job from '../models/Job.js' // Job Model

// @desc    Post a new job
// @route   POST /api/jobs
export const postJob = async (req, res) => {
  try {
    // extract job details
    const { title, description, location, category, postedBy, budget, media } = req.body

    // Creates a new Job document with all fields
    const newJob = new Job({
      title,
      description,
      location,
      category,
      postedBy, // User ID
      budget,
      media, // array of image URLs 
    })
    
    
    const savedJob = await newJob.save()
    res.status(201).json({ message: 'Job posted successfully', job: savedJob })
  } catch (err) {
    res.status(500).json({ message: 'Failed to post job', error: err.message })
  }
}

// @desc    Get all job listings
// @route   GET /api/jobs
// @desc    Get all jobs with optional pagination
// @route   GET /api/jobs?page=1
export const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Job.countDocuments()

    res.status(200).json({
      jobs,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message })
  }
}


// @desc    Get single job by ID
// @route   GET /api/jobs/:id
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email role')
    if (!job) return res.status(404).json({ message: 'Job not found' })

    res.status(200).json(job)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching job', error: err.message })
  }
}

// @desc    Update a job (Optional for future use)
// @route   PUT /api/jobs/:id
export const updateJob = async (req, res) => {
  try {
    const { title, description, location, category, budget, media } = req.body

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, location, category, budget, media } },
      { new: true }
    )

    if (!updatedJob) return res.status(404).json({ message: 'Job not found' })

    res.status(200).json({ message: 'Job updated', job: updatedJob })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update job', error: err.message })
  }
}

// @desc    Delete a job (Optional for admin)
// @route   DELETE /api/jobs/:id
export const deleteJob = async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id)
    if (!deletedJob) return res.status(404).json({ message: 'Job not found' })

    res.status(200).json({ message: 'Job deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting job', error: err.message })
  }
}

