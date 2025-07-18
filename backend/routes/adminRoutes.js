import express from 'express'
import {
  getAllUsers,
  getAllLaborers,
  getAllJobs,
  approveLaborer,
  getAllChats,
  getAllReviews,
} from '../controllers/adminController.js'

import { protect, isAdmin } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 📌 GET /api/admin/users - Get all users
router.get('/users', protect, isAdmin, getAllUsers)

// 📌 GET /api/admin/laborers - Get all laborers
router.get('/laborers', protect, isAdmin, getAllLaborers)

// 📌 PUT /api/admin/laborers/:id/approve - Approve laborer profile
router.put('/laborers/:id/approve', protect, isAdmin, approveLaborer)

// 📌 GET /api/admin/jobs - Get all job posts
router.get('/jobs', protect, isAdmin, getAllJobs)

// 📌 GET /api/admin/chats - View all chats
router.get('/chats', protect, isAdmin, getAllChats)

// 📌 GET /api/admin/reviews - View all reviews
router.get('/reviews', protect, isAdmin, getAllReviews)

export default router
