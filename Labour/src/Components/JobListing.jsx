// src/components/JobListing.jsx
import React, { useState } from 'react';
import authService from '../services/authService';
import axiosInstance from '../utils/axiosInstance';
import { useToast } from './ToastContext';

const jobData = [
  {
    id: 1,
    title: 'Need Electrician for House Wiring',
    description: 'Looking for a certified electrician to rewire a 2BHK flat.',
    specialization: 'Electrician',
    location: 'Jaipur, Rajasthan',
    budget: '₹5,000 - ₹7,000',
    status: 'Open',
    posted: '2 hours ago',
  },
  {
    id: 2,
    title: 'Plumber Required for Bathroom Leakage',
    description: 'Urgent requirement of a plumber for fixing bathroom pipe leakage.',
    specialization: 'Plumber',
    location: 'Bikaner, Rajasthan',
    budget: '₹800',
    status: 'Urgent',
    posted: 'Today',
  },
  {
    id: 3,
    title: 'Painter Needed for Interior Painting',
    description: 'Looking to get interior walls painted in 3 rooms.',
    specialization: 'Painter',
    location: 'Jodhpur, Rajasthan',
    budget: '₹3,000 - ₹4,000',
    status: 'Open',
    posted: 'Yesterday',
  },
];

const statusBadge = (status) => {
  if (status === 'Urgent') return <span className="badge bg-danger ms-2">Urgent</span>;
  if (status === 'Open') return <span className="badge bg-success ms-2">Open</span>;
  return <span className="badge bg-secondary ms-2">{status}</span>;
};

const iconForSpecialization = (spec) => {
  switch (spec) {
    case 'Electrician': return '💡';
    case 'Plumber': return '🔧';
    case 'Painter': return '🎨';
    case 'Carpenter': return '🪚';
    default: return '🛠️';
  }
};

const JobListing = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowModal(true);
    setMessage('');
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedJob(null);
    setMessage('');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setLoading(true);
    try {
      const user = authService.getStoredUser();
      if (!user || user.role !== 'laborer') {
        showToast('Only laborers can apply for jobs. Please login as a laborer.', 'danger');
        setLoading(false);
        return;
      }
      await axiosInstance.post('/applications/apply', {
        jobId: selectedJob.id, // In real app, use job._id from backend
        applicantId: user._id,
        message,
      });
      showToast('Application submitted successfully!', 'success');
      handleModalClose();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to apply for job', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold text-primary">Latest Job Listings</h2>
      <div className="row g-4">
        {jobData.map((job) => (
          <div className="col-md-6 col-lg-4" key={job.id}>
            <div className="card h-100 shadow-lg rounded-2xl border-0">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center mb-2">
                  <span style={{ fontSize: '2rem' }} className="me-2">{iconForSpecialization(job.specialization)}</span>
                  <h5 className="card-title mb-0 flex-grow-1">{job.title}</h5>
                  {statusBadge(job.status)}
                </div>
                <p className="card-text text-muted mb-2" style={{ minHeight: 48 }}>{job.description}</p>
                <ul className="list-unstyled small mb-3">
                  <li><span className="fw-semibold">Specialization:</span> {job.specialization}</li>
                  <li><span className="fw-semibold">Location:</span> <span className="text-primary">📍 {job.location}</span></li>
                  <li><span className="fw-semibold">Budget:</span> <span className="text-success">{job.budget}</span></li>
                  <li><span className="fw-semibold">Posted:</span> {job.posted}</li>
                </ul>
                <button className="btn btn-primary w-100 rounded-pill mt-auto d-flex align-items-center justify-content-center gap-2" onClick={() => handleApplyClick(job)}>
                  <span>Apply Now</span> <span>➡️</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Apply Now Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Apply for: {selectedJob?.title}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleModalClose}></button>
              </div>
              <form onSubmit={handleApplySubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="applicationMessage" className="form-label">Message to Employer (optional)</label>
                    <textarea
                      id="applicationMessage"
                      className="form-control"
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleModalClose} disabled={loading}>Cancel</button>
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListing;
