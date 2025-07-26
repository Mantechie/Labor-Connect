// h:\Labour\backend\routes\jobApplicationRoutes.js
import express from 'express';
import { 
  applyToJob, 
  getAllApplications, 
  getApplicationsForJob, 
  approveApplication, 
  rejectApplication 
} from '../controllers/jobApplicationController.js';
import { protect, hasRole } from '../middlewares/authMiddleware.js';
import { 
  applyToJobValidation, 
  getApplicationsValidation, 
  jobIdParamValidation, 
  applicationIdParamValidation 
} from '../validations/jobApplicationValidation.js';
import { apiLimiter } from '../middlewares/ratelimiter.js';
import { cacheMiddleware, clearCache } from '../middlewares/cacheMiddleware.js';

const router = express.Router();

// Apply to job - with rate limiting
router.post('/apply', apiLimiter, protect, applyToJobValidation, (req, res, next) => {
  // Clear cache when new application is submitted
  res.on('finish', () => {
    if (res.statusCode === 201) {
      clearCache('applications');
    }
  });
  next();
}, applyToJob);

// Get all applications - admin only, with caching
router.get('/', 
  protect, 
  hasRole(['admin']), 
  getApplicationsValidation, 
  cacheMiddleware('applications', 300), // 5 minute cache
  getAllApplications
);

// Get applications for a specific job - with validation and caching
router.get('/job/:jobId', 
  protect, 
  jobIdParamValidation, 
  cacheMiddleware('job_applications', 300),
  getApplicationsForJob
);

// Approve application - admin only
router.patch('/:id/approve', 
  protect, 
  hasRole(['admin']), 
  applicationIdParamValidation, 
  (req, res, next) => {
    // Clear cache when application status changes
    res.on('finish', () => {
      if (res.statusCode === 200) {
        clearCache('applications');
        clearCache('job_applications');
      }
    });
    next();
  },
  approveApplication
);

// Reject application - admin only
router.patch('/:id/reject', 
  protect, 
  hasRole(['admin']), 
  applicationIdParamValidation, 
  (req, res, next) => {
    // Clear cache when application status changes
    res.on('finish', () => {
      if (res.statusCode === 200) {
        clearCache('applications');
        clearCache('job_applications');
      }
    });
    next();
  },
  rejectApplication
);

export default router;
