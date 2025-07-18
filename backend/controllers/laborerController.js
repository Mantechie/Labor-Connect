import User from '../models/User.js'

// @desc    Get all laborers
// @route   GET /api/laborers
export const getAllLaborers = async (req, res) => {
  try {
    const laborers = await User.find({ role: 'laborer' }).select('-password')
    res.status(200).json(laborers)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch laborers', error: err.message })
  }
}

// @desc    Get profile of logged-in laborer
// @route   GET /api/users/profile
// @access  Private (Laborer)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    if (!user || user.role !== 'laborer') {
      return res.status(404).json({ message: 'Laborer not found' })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Toggle laborer's availability
// @route   PATCH /api/laborers/:id/availability
// @access  Private (Laborer)
export const toggleAvailability = async (req, res) => {
  try {
    const laborer = await User.findById(req.params.id)

    if (!laborer || laborer.role !== 'laborer') {
      return res.status(404).json({ message: 'Laborer not found' })
    }

    laborer.availability = !laborer.availability
    await laborer.save()

    res.status(200).json({
      message: `Availability updated to ${laborer.availability}`,
      availability: laborer.availability,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error: error.message })
  }
}

// @desc    Upload portfolio media (image/video)
// @route   POST /api/laborers/:id/portfolio
// @access  Private (Laborer)
export const uploadPortfolio = async (req, res) => {
  try {
    const laborer = await User.findById(req.params.id)

    if (!laborer || laborer.role !== 'laborer') {
      return res.status(404).json({ message: 'Laborer not found' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No media file uploaded' })
    }

    // Push file path to media array
    laborer.media.push(`/uploads/${req.file.filename}`)
    await laborer.save()

    res.status(200).json({
      message: 'Portfolio uploaded successfully',
      media: laborer.media,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error uploading portfolio', error: error.message })
  }
}

// @desc    Get a single laborer by ID
// @route   GET /api/laborers/:id
export const getLaborerById = async (req, res) => {
  try {
    const laborer = await User.findById(req.params.id).select('-password')

    if (!laborer || laborer.role !== 'laborer') {
      return res.status(404).json({ message: 'Laborer not found' })
    }

    res.status(200).json(laborer)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching laborer', error: err.message })
  }
}

// @desc    Update laborer profile
// @route   PUT /api/laborers/:id
export const updateLaborerProfile = async (req, res) => {
  try {
    const { name, specialization, availability, description, socialLinks, media } = req.body

    const laborer = await User.findById(req.params.id)

    if (!laborer || laborer.role !== 'laborer') {
      return res.status(404).json({ message: 'Laborer not found' })
    }

    laborer.name = name || laborer.name
    laborer.specialization = specialization || laborer.specialization
    laborer.availability = availability || laborer.availability
    laborer.description = description || laborer.description
    laborer.socialLinks = socialLinks || laborer.socialLinks
    laborer.media = media || laborer.media

    const updatedLaborer = await laborer.save()

    res.status(200).json({
      message: 'Laborer profile updated',
      laborer: {
        id: updatedLaborer._id,
        name: updatedLaborer.name,
        specialization: updatedLaborer.specialization,
        availability: updatedLaborer.availability,
        description: updatedLaborer.description,
        socialLinks: updatedLaborer.socialLinks,
        media: updatedLaborer.media,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message })
  }
}

// @desc    Get laborer dashboard
// @route   GET /api/laborers/dashboard
// @access  Private (Laborer)
export const getLaborerDashboard = async (req, res) => {
  try {
    const laborer = await User.findById(req.user._id).select('-password')

    if (!laborer || laborer.role !== 'laborer') {
      return res.status(404).json({ message: 'Laborer not found' })
    }

    // Get assigned jobs for this laborer
    const Job = (await import('../models/Job.js')).default
    const assignedJobs = await Job.find({ assignedLaborer: req.user._id })

    res.status(200).json({
      laborer,
      assignedJobs,
      stats: {
        totalJobs: assignedJobs.length,
        completedJobs: assignedJobs.filter(job => job.status === 'completed').length,
        pendingJobs: assignedJobs.filter(job => job.status === 'in progress').length,
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Update laborer specialization
// @route   PUT /api/laborers/specialization
// @access  Private (Laborer)
export const updateSpecialization = async (req, res) => {
  try {
    const { specialization } = req.body

    const laborer = await User.findById(req.user._id)

    if (!laborer || laborer.role !== 'laborer') {
      return res.status(404).json({ message: 'Laborer not found' })
    }

    laborer.specialization = specialization
    await laborer.save()

    res.status(200).json({
      message: 'Specialization updated successfully',
      specialization: laborer.specialization,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error updating specialization', error: error.message })
  }
}

// @desc    Upload work media
// @route   POST /api/laborers/media
// @access  Private (Laborer)
export const uploadWorkMedia = async (req, res) => {
  try {
    const laborer = await User.findById(req.user._id)

    if (!laborer || laborer.role !== 'laborer') {
      return res.status(404).json({ message: 'Laborer not found' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No media file uploaded' })
    }

    // Push file path to media array
    laborer.media.push(`/uploads/${req.file.filename}`)
    await laborer.save()

    res.status(200).json({
      message: 'Work media uploaded successfully',
      media: laborer.media,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error uploading work media', error: error.message })
  }
}

// @desc    Update availability status
// @route   PATCH /api/laborers/availability
// @access  Private (Laborer)
export const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body

    const laborer = await User.findById(req.user._id)

    if (!laborer || laborer.role !== 'laborer') {
      return res.status(404).json({ message: 'Laborer not found' })
    }

    laborer.isAvailable = isAvailable
    await laborer.save()

    res.status(200).json({
      message: `Availability updated to ${isAvailable ? 'available' : 'unavailable'}`,
      isAvailable: laborer.isAvailable,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error: error.message })
  }
}

// @desc    Get assigned jobs for laborer
// @route   GET /api/laborers/jobs
// @access  Private (Laborer)
export const getAssignedJobs = async (req, res) => {
  try {
    const Job = (await import('../models/Job.js')).default
    const assignedJobs = await Job.find({ assignedLaborer: req.user._id })
      .populate('postedBy', 'name email phone')
      .sort({ createdAt: -1 })

    res.status(200).json({
      assignedJobs,
      count: assignedJobs.length,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assigned jobs', error: error.message })
  }
}
