import express from 'express'
import {
  postJob,
  getAllJobs,
  getJobById,
  deleteJob,
} from '../controllers/jobController.js'

import verifyOwner from '../middlewares/verifyOwner.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 📌 POST /api/jobs - Post a new job (user only)
router.post('/', protect, postJob)

// 📌 GET /api/jobs - Get all jobs (public or filtered view)
router.get('/', getAllJobs)

// 📌 GET /api/jobs/:id - Get specific job details
router.get('/:id', protect, getJobById)

// 📌 DELETE /api/jobs/:id - Delete a job (user or admin)
router.delete('/:id', protect, verifyOwner, deleteJob)

export default router
