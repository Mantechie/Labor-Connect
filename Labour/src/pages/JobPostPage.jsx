// src/pages/JobPostPage.jsx
import React, { useState } from 'react';

const JobPostPage = () => {
  const [job, setJob] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    budget: '',
    media: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'media') {
      setJob({ ...job, media: files[0] });
    } else {
      setJob({ ...job, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Job Posted:', job);
    alert('Job posted successfully!');
    // You can later connect this to backend API
  };

  const categories = ['Electrician', 'Plumber', 'Mason', 'Painter', 'Carpenter', 'General Labor'];

  return (
    <div className="container py-4">
      <h3 className="mb-4">Post a Job Requirement</h3>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Job Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            placeholder="e.g. Need electrician for fan installation"
            value={job.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Job Description</label>
          <textarea
            className="form-control"
            name="description"
            rows="4"
            placeholder="Describe the job requirements..."
            value={job.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              name="location"
              placeholder="City, Area"
              value={job.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              name="category"
              value={job.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Budget (Optional)</label>
            <input
              type="number"
              className="form-control"
              name="budget"
              placeholder="e.g. 500"
              value={job.budget}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Upload Reference Photo (Optional)</label>
            <input
              type="file"
              className="form-control"
              name="media"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="text-end">
          <button type="submit" className="btn btn-success">Post Job</button>
        </div>
      </form>
    </div>
  );
};

export default JobPostPage;
