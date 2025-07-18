// src/components/JobListing.jsx
import React from 'react';

const jobData = [
  {
    id: 1,
    title: 'Need Electrician for House Wiring',
    description: 'Looking for a certified electrician to rewire a 2BHK flat.',
    specialization: 'Electrician',
    location: 'Jaipur, Rajasthan',
    budget: '₹5,000 - ₹7,000',
  },
  {
    id: 2,
    title: 'Plumber Required for Bathroom Leakage',
    description: 'Urgent requirement of a plumber for fixing bathroom pipe leakage.',
    specialization: 'Plumber',
    location: 'Bikaner, Rajasthan',
    budget: '₹800',
  },
  {
    id: 3,
    title: 'Painter Needed for Interior Painting',
    description: 'Looking to get interior walls painted in 3 rooms.',
    specialization: 'Painter',
    location: 'Jodhpur, Rajasthan',
    budget: '₹3,000 - ₹4,000',
  },
];

const JobListing = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Latest Job Listings</h2>
      <div className="row">
        {jobData.map((job) => (
          <div className="col-md-6 col-lg-4 mb-4" key={job.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{job.title}</h5>
                <p className="card-text">{job.description}</p>
                <ul className="list-unstyled small mb-2">
                  <li><strong>Specialization:</strong> {job.specialization}</li>
                  <li><strong>Location:</strong> {job.location}</li>
                  <li><strong>Budget:</strong> {job.budget}</li>
                </ul>
                <button className="btn btn-primary w-100">Apply Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobListing;
