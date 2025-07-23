import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getJobRequests,
  handleJobAction,
  updateProfile,
  updateAvailability,
  uploadDocuments,
  getPortfolio,
  addPortfolioItem,
  getEarnings,
  getCompletedJobs,
  browseLaborers,
  upload
} from '../controllers/laborerController.js';

const router = express.Router();

// Browse route should be public (no authentication required)
router.get('/browse', browseLaborers);

// All other routes require authentication
router.use(protect);

// Job management routes
router.get('/job-requests', getJobRequests);
router.put('/jobs/:jobId/:action', handleJobAction); // accept/reject
router.get('/completed-jobs', getCompletedJobs);

// Profile management routes
router.put('/profile', updateProfile);
router.put('/availability', updateAvailability);

// Document upload routes
router.post('/documents', upload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'workLicense', maxCount: 1 },
  { name: 'otherDocs', maxCount: 5 }
]), uploadDocuments);

// Portfolio routes
router.get('/portfolio', getPortfolio);
router.post('/portfolio', upload.single('image'), addPortfolioItem);

// Earnings routes
router.get('/earnings', getEarnings);



export default router;
