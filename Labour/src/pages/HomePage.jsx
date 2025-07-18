import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const categories = [
    { title: 'Electrician', img: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png' },
    { title: 'Plumber', img: 'https://cdn-icons-png.flaticon.com/512/2965/2965564.png' },
    { title: 'Mason', img: 'https://cdn-icons-png.flaticon.com/512/2965/2965556.png' },
    { title: 'Carpenter', img: 'https://cdn-icons-png.flaticon.com/512/2965/2965561.png' },
  ];

  const [featuredLaborers, setFeaturedLaborers] = useState([]);

  useEffect(() => {
    const fetchLaborers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/laborers');
        const data = await res.json();
        setFeaturedLaborers(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch laborers:', err);
      }
    };

    fetchLaborers();
  }, []);

  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="fw-bold">Find Trusted Laborers Near You</h1>
        <p className="text-muted">Quick, Verified, and Reliable</p>
        <div className="input-group w-75 mx-auto">
          <input type="text" className="form-control" placeholder="Search for electrician, plumber..." />
          <button className="btn btn-primary">Search</button>
        </div>
      </div>

      {/* Categories */}
      <h4 className="mb-3">Popular Categories</h4>
      <div className="row mb-5">
        {categories.map((cat, idx) => (
          <div className="col-md-3 mb-3" key={idx}>
            <div className="card text-center p-3 shadow-sm">
              <img src={cat.img} alt={cat.title} style={{ width: 60, height: 60 }} className="mx-auto mb-2" />
              <h6>{cat.title}</h6>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Laborers */}
      <h4 className="mb-3">Featured Laborers</h4>
      <div className="row mb-5">
        {featuredLaborers.map((lab, idx) => (
          <div className="col-md-4 mb-3" key={idx}>
            <div className="card p-3 shadow-sm">
              <h5>{lab.name}</h5>
              <p>{lab.specialization}</p>
              <p>⭐ {lab.rating || 'N/A'} / 5</p>
              <Link to={`/laborers/${lab._id}`} className="btn btn-sm btn-outline-primary">View Profile</Link>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="text-center">
        <Link to="/job-post" className="btn btn-success me-2">Post a Job</Link>
        <Link to="/signup" className="btn btn-outline-secondary">Join Now</Link>
      </div>
    </div>
  );
};

export default HomePage;
