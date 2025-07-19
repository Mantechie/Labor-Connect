import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  uploadProfilePhoto,
  getPostedJobs,
  getHiredLabor,
  deleteUserProfile
} from '../controllers/userController.js'

const router = express.Router()

// All routes are protected
router.use(protect)

// Profile management
router.get('/profile', getUserProfile)
router.put('/profile', updateUserProfile)
router.put('/password', updatePassword)
router.post('/profile-photo', uploadProfilePhoto)
router.delete('/profile', deleteUserProfile)

// History
router.get('/posted-jobs', getPostedJobs)
router.get('/hired-labor', getHiredLabor)

export default router
