// h:\Labour\backend\tests\unit\jobApplicationController.test.js
import mongoose from 'mongoose';
import { applyToJob, getAllApplications, getApplicationsForJob, approveApplication, rejectApplication } from '../../controllers/jobApplicationController.js';
import JobApplication from '../../models/JobApplication.js';
import Job from '../../models/Job.js';
import Laborer from '../../models/Laborer.js';

// Mock dependencies
jest.mock('../../models/JobApplication.js');
jest.mock('../../models/Job.js');
jest.mock('../../models/Laborer.js');
jest.mock('../../utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  },
}));
jest.mock('../../utils/jobApplicationLogger.js', () => ({
  jobApplicationLogger: {
    apply: jest.fn(),
    statusChange: jest.fn(),
    list: jest.fn()
  }
}));

describe('Job Application Controller', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123', role: 'admin' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('applyToJob', () => {
    it('should create a new job application', async () => {
      // Setup
      const mockJob = { _id: 'job123', title: 'Test Job' };
      const mockLaborer = { _id: 'laborer123', name: 'Test Laborer' };
      const mockApplication = { 
        _id: 'app123', 
        jobId: 'job123', 
        applicantId: 'laborer123',
        save: jest.fn().mockResolvedValue(true)
      };
      
      req.body = { jobId: 'job123', applicantId: 'laborer123', message: 'Test message' };
      
      Job.findById = jest.fn().mockResolvedValue(mockJob);
      Laborer.findById = jest.fn().mockResolvedValue(mockLaborer);
      JobApplication.findOne = jest.fn().mockResolvedValue(null);
      JobApplication.mockImplementation(() => mockApplication);
      
      // Execute
      await applyToJob(req, res);
      
      // Assert
      expect(Job.findById).toHaveBeenCalledWith('job123');
      expect(Laborer.findById).toHaveBeenCalledWith('laborer123');
      expect(JobApplication.findOne).toHaveBeenCalledWith({ jobId: 'job123', applicantId: 'laborer123' });
      expect(mockApplication.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Application submitted successfully'
      }));
    });
    
    it('should return error if job not found', async () => {
      // Setup
      req.body = { jobId: 'job123', applicantId: 'laborer123' };
      
      Job.findById = jest.fn().mockResolvedValue(null);
      
      // Execute
      await applyToJob(req, res);
      
      // Assert
      expect(Job.findById).toHaveBeenCalledWith('job123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Job not found'
      }));
    });
    
    it('should return error if already applied', async () => {
      // Setup
      const mockJob = { _id: 'job123', title: 'Test Job' };
      const mockLaborer = { _id: 'laborer123', name: 'Test Laborer' };
      const existingApplication = { _id: 'app123' };
      
      req.body = { jobId: 'job123', applicantId: 'laborer123' };
      
      Job.findById = jest.fn().mockResolvedValue(mockJob);
      Laborer.findById = jest.fn().mockResolvedValue(mockLaborer);
      JobApplication.findOne = jest.fn().mockResolvedValue(existingApplication);
      
      // Execute
      await applyToJob(req, res);
      
      // Assert
      expect(JobApplication.findOne).toHaveBeenCalledWith({ jobId: 'job123', applicantId: 'laborer123' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'You have already applied to this job'
      }));
    });
  });
  
  // Add more tests for other controller methods...
});
