// src/pages/JobPostPage.jsx
import React, { useState } from 'react';
import { useToast } from '../Components/ToastContext';

const JobPostPage = () => {
  const [job, setJob] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    budget: '',
    media: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({});
  const { showToast } = useToast();
  // Remove dynamic categories state and effect
  const categories = ['Electrician', 'Plumber', 'Mason', 'Painter', 'Carpenter', 'General Labor'];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setError('');
    setFieldError({ ...fieldError, [name]: '' });
    if (name === 'media') {
      setJob({ ...job, media: files[0] });
    } else {
      setJob({ ...job, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldError({});
    let errors = {};
    if (!job.title) errors.title = 'Job title is required';
    if (!job.description) errors.description = 'Description is required';
    if (!job.location) errors.location = 'Location is required';
    if (!job.category) errors.category = 'Category is required';
    if (Object.keys(errors).length > 0) {
      setFieldError(errors);
      setLoading(false);
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showToast('Job posted successfully!', 'success');
    }, 1200);
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Post a Job Requirement</h3>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm" autoComplete="off">
        <div className="form-floating mb-3">
          <input
            type="text"
            className={`form-control ${fieldError.title ? 'is-invalid' : ''}`}
            id="floatingTitle"
            name="title"
            placeholder="Job Title"
            value={job.title}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <label htmlFor="floatingTitle">Job Title</label>
          {fieldError.title && <div className="invalid-feedback">{fieldError.title}</div>}
        </div>

        <div className="form-floating mb-3">
          <textarea
            className={`form-control ${fieldError.description ? 'is-invalid' : ''}`}
            id="floatingDescription"
            name="description"
            placeholder="Job Description"
            style={{ minHeight: 100 }}
            value={job.description}
            onChange={handleChange}
            required
            disabled={loading}
          ></textarea>
          <label htmlFor="floatingDescription">Job Description</label>
          {fieldError.description && <div className="invalid-feedback">{fieldError.description}</div>}
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="form-floating">
              <input
                type="text"
                className={`form-control ${fieldError.location ? 'is-invalid' : ''}`}
                id="floatingLocation"
                name="location"
                placeholder="Location"
                value={job.location}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <label htmlFor="floatingLocation">Location</label>
              {fieldError.location && <div className="invalid-feedback">{fieldError.location}</div>}
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="form-floating">
              <select
                className={`form-select ${fieldError.category ? 'is-invalid' : ''}`}
                id="floatingCategory"
                name="category"
                value={job.category}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select category</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
              <label htmlFor="floatingCategory">Category</label>
              {fieldError.category && <div className="invalid-feedback">{fieldError.category}</div>}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="form-floating">
              <input
                type="number"
                className="form-control"
                id="floatingBudget"
                name="budget"
                placeholder="Budget"
                value={job.budget}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="floatingBudget">Budget</label>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Upload Reference Photo (Optional)</label>
            <input
              type="file"
              className="form-control"
              name="media"
              accept="image/*"
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="text-end">
          <button type="submit" className="btn btn-success d-flex align-items-center gap-2" disabled={loading}>
            {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPostPage;
