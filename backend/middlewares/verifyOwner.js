import Job from '../models/Job.js'
import asyncHandler from 'express-async-handler'

const verifyOwner = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id)

  if (!job) {
    res.status(404)
    throw new Error('Job not found')
  }

  if (String(job.postedBy) !== String(req.user.id)) {
    res.status(403)
    throw new Error('Not authorized to perform this action')
  }

  next()
})

export default verifyOwner
