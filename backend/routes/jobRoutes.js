import express from 'express'
import {
  postJob,
  getAllJobs,
  getJobById,
  deleteJob,
  updateJob,
} from '../controllers/jobController.js'

import { validateJobCreation, validateJobUpdate, validateJobFilters } from '../validations/jobValidations.js'
import verifyOwner from '../middlewares/verifyOwner.js'
import { protect } from '../middlewares/authMiddleware.js'
import { apiLimiter, createJobLimiter } from '../middlewares/ratelimiter.js'

const router = express.Router()

// 📌 POST /api/jobs - Post a new job (user only)
router.post('/', protect, createJobLimiter, validateJobCreation, postJob)

// 📌 GET /api/jobs - Get all jobs (public or filtered view)
router.get('/', validateJobFilters, getAllJobs)

// 📌 GET /api/jobs/:id - Get specific job details
router.get('/:id', protect, getJobById)

// 📌 PUT /api/jobs/:id - Update a job (owner only)
router.put('/:id', protect, verifyOwner, validateJobUpdate, updateJob)

// 📌 DELETE /api/jobs/:id - Delete a job (owner or admin)
router.delete('/:id', protect, verifyOwner, deleteJob)

export default router