import React, { useState } from 'react';
import reportService from '../services/reportService';

const UserComplaints = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'other',
    referenceId: '',
    message: '',
  });

  const [status, setStatus] = useState({ success: null, message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: null, message: '' });

    if (!formData.message.trim()) {
      setStatus({ success: false, message: 'Message is required' });
      return;
    }

    try {
      await reportService.submitReport(formData);
      setStatus({ success: true, message: 'Complaint submitted successfully' });
      setFormData({
        name: '',
        email: '',
        type: 'other',
        referenceId: '',
        message: '',
      });
    } catch (error) {
      setStatus({
        success: false,
        message: error.response?.data?.error || 'Failed to submit complaint',
      });
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4">
        <h2 className="mb-4 text-center">Submit a Complaint</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label" required >Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label" required>Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="type" className="form-label">Type:</label>
            <select
              className="form-select"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="job">Job</option>
              <option value="laborer">Laborer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="referenceId" className="form-label">Reference ID (optional):</label>
            <input
              type="text"
              className="form-control"
              id="referenceId"
              name="referenceId"
              value={formData.referenceId}
              onChange={handleChange}
              placeholder="Enter reference ID"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label">Message<span className="text-danger">*</span>:</label>
            <textarea
              className="form-control"
              id="message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Describe your complaint..."
            ></textarea>
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary rounded-pill fw-semibold">
              Submit Complaint
            </button>
          </div>
        </form>

        {status.message && (
          <div className={`alert mt-4 ${status.success ? 'alert-success' : 'alert-danger'}`} role="alert">
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserComplaints;
