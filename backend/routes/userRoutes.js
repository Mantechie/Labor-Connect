import express from 'express'
import {
  getUserProfile,
  updateLaborerProfile,
  toggleAvailability,
  uploadPortfolio,
  getLaborerById,
} from '../controllers/laborerController.js'

import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 📌 GET /api/users/profile - Get logged-in user/laborer profile
router.get('/profile', protect, getUserProfile)

// 📌 PUT /api/users/profile - Update profile details
router.put('/profile', protect, updateLaborerProfile)

// 📌 PATCH /api/users/availability - Toggle availability (available/busy)
router.patch('/availability', protect, toggleAvailability)

// 📌 POST /api/users/portfolio - Upload portfolio (images/videos)
router.post('/portfolio', protect, uploadPortfolio)

// 📌 GET /api/users/laborers - Fetch filtered laborers (by region, skill, rating, etc.)
router.get('/laborers', getLaborerById)

export default router
