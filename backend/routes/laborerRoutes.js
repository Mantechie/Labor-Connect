import express from 'express'
import {
  getLaborerDashboard,
  updateSpecialization,
  uploadWorkMedia,
  updateAvailability,
  getAssignedJobs,
} from '../controllers/laborerController.js'

import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 📌 GET /api/laborers/dashboard - Laborer's own dashboard info
router.get('/dashboard', protect, getLaborerDashboard)

// 📌 PUT /api/laborers/specialization - Update laborer's work specialization
router.put('/specialization', protect, updateSpecialization)

// 📌 POST /api/laborers/media - Upload photos/videos of completed work
router.post('/media', protect, uploadWorkMedia)

// 📌 PATCH /api/laborers/availability - Set availability status
router.patch('/availability', protect, updateAvailability)

// 📌 GET /api/laborers/jobs - Get job requests/assignments for the laborer
router.get('/jobs', protect, getAssignedJobs)

export default router
