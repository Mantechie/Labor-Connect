import Job from '../models/Job.js'

const verifyOwner = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    if (String(job.postedBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to perform this action' })
    }

    next()
  } catch (error) {
    res.status(500).json({ message: 'Authorization failed', error: error.message })
  }
}

export default verifyOwner
