import express from 'express'
import {
  postReview,
  getReviewsForLaborer,
  deleteReview,
  verifyReview,
} from '../controllers/reviewController.js'

import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 📌 POST /api/reviews/:laborerId - Create a review for a laborer
router.post('/:laborerId', protect, postReview)

// 📌 GET /api/reviews/:laborerId - Get all reviews for a specific laborer
router.get('/:laborerId', getReviewsForLaborer)

// 📌 DELETE /api/reviews/:reviewId - Delete a review (optional, for admin/moderation)
router.delete('/:reviewId', protect, deleteReview)

// 📌 PATCH /api/reviews/:reviewId/verify - Admin verifies review (optional)
router.patch('/:reviewId/verify', protect, verifyReview)

export default router
