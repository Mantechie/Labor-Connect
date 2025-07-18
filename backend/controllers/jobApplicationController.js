import JobApplication from '../models/JobApplication.js';
import Job from '../models/Job.js';
import Laborer from '../models/Laborer.js';

// POST /api/applications/apply
export const applyToJob = async (req, res) => {
  try {
    const { jobId, applicantId, message } = req.body;
    if (!jobId || !applicantId) {
      return res.status(400).json({ error: 'jobId and applicantId are required' });
    }
    // Optionally check if already applied
    const existing = await JobApplication.findOne({ jobId, applicantId });
    if (existing) {
      return res.status(400).json({ error: 'You have already applied to this job.' });
    }
    const application = new JobApplication({ jobId, applicantId, message });
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply to job' });
  }
};

// GET /api/applications (admin, with filters)
export const getAllApplications = async (req, res) => {
  try {
    const { status, job, applicant, search } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (job) filter.jobId = job;
    if (applicant) filter.applicantId = applicant;

    let query = JobApplication.find(filter)
      .populate('jobId', 'title category location')
      .populate('applicantId', 'name specialization');

    // If search keyword, filter by job title or applicant name
    if (search) {
      // Get all applications, then filter in-memory (for simplicity)
      let all = await query.exec();
      all = all.filter(app =>
        (app.jobId?.title?.toLowerCase().includes(search.toLowerCase()) ||
         app.applicantId?.name?.toLowerCase().includes(search.toLowerCase()))
      );
      return res.json(all);
    }

    const applications = await query.exec();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// GET /api/applications/job/:jobId
export const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await JobApplication.find({ jobId })
      .populate('applicantId', 'name specialization');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications for job' });
  }
};

// PATCH /api/applications/:id/approve
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application approved', application });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve application' });
  }
};

// PATCH /api/applications/:id/reject
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application rejected', application });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject application' });
  }
}; 