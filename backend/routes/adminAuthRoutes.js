import express from 'express';
import { protectAdmin } from '../middlewares/adminAuthMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import {
  registerAdmin,
  adminLogin,
  sendAdminOTP,
  verifyAdminOTP,
  refreshAdminToken,
  adminLogout,
  getCurrentAdmin,
  updateProfile,
  changePassword,
  uploadAdminProfilePicture,
  getAdminCollaborators,
  addAdminCollaborator,
  removeAdminCollaborator
} from '../controllers/adminAuthController.js';

const router = express.Router();

// Production-ready routes without debug logs

// Public routes - NO middleware applied
router.post('/register', registerAdmin);
router.post('/login', adminLogin);
router.post('/send-otp', sendAdminOTP);

router.post('/verify-otp', (req, res, next) => {
  console.log('🔍 Hitting /verify-otp route');
  next();
}, verifyAdminOTP);

router.post('/refresh', (req, res, next) => {
  console.log('🔍 Hitting /refresh route');
  next();
}, refreshAdminToken);

// Protected routes - use admin middleware
router.post('/logout', (req, res, next) => {
  console.log('🔍 Hitting /logout route - PROTECTED');
  next();
}, protectAdmin, adminLogout);

router.get('/me', (req, res, next) => {
  console.log('🔍 Hitting /me route - PROTECTED');
  next();
}, protectAdmin, getCurrentAdmin);

// OTP routes for sensitive operations
router.post('/generate-otp', (req, res, next) => {
  console.log('🔍 Hitting /generate-otp route - PROTECTED');
  next();
}, protectAdmin, sendAdminOTP);

// Profile management routes
router.put('/profile', protectAdmin, updateProfile);
router.put('/change-password', protectAdmin, changePassword);
router.put('/profile-picture', protectAdmin, upload.single('profilePicture'), uploadAdminProfilePicture);

// Collaboration routes
router.get('/collaborators', (req, res, next) => {
  console.log('🔍 Hitting /collaborators route - PROTECTED');
  next();
}, protectAdmin, getAdminCollaborators);

router.post('/collaborator', (req, res, next) => {
  console.log('🔍 Hitting /collaborator route - PROTECTED');
  next();
}, protectAdmin, addAdminCollaborator);

router.delete('/collaborator/:id', (req, res, next) => {
  console.log('🔍 Hitting /collaborator/:id route - PROTECTED');
  next();
}, protectAdmin, removeAdminCollaborator);

export default router; 