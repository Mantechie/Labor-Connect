import express from 'express';
import { protectAdmin } from '../middlewares/adminAuthMiddleware.js';
import {
  registerAdmin,
  adminLogin,
  sendAdminOTP,
  verifyAdminOTP,
  refreshAdminToken,
  adminLogout,
  getCurrentAdmin
} from '../controllers/adminAuthController.js';

const router = express.Router();

// Debug middleware for admin routes
router.use((req, res, next) => {
  console.log('🔍 Admin Auth Route Debug:', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    url: req.url,
    baseUrl: req.baseUrl,
    body: req.body
  });
  next();
});

// Public routes - NO middleware applied
router.post('/register', (req, res, next) => {
  console.log('🔍 Hitting /register route');
  next();
}, registerAdmin);

router.post('/login', (req, res, next) => {
  console.log('🔍 Hitting /login route - PUBLIC');
  next();
}, adminLogin);

router.post('/send-otp', (req, res, next) => {
  console.log('🔍 Hitting /send-otp route');
  next();
}, sendAdminOTP);

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

export default router; 