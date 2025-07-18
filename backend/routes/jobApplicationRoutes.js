import express from 'express';
import { applyToJob, getAllApplications, getApplicationsForJob, approveApplication, rejectApplication } from '../controllers/jobApplicationController.js';

const router = express.Router();

router.post('/apply', applyToJob);
router.get('/', getAllApplications); // admin
router.get('/job/:jobId', getApplicationsForJob);
router.patch('/:id/approve', approveApplication); // admin
router.patch('/:id/reject', rejectApplication); // admin

export default router; 