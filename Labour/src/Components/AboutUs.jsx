import React from 'react';      
import 'bootstrap/dist/css/bootstrap.min.css';

const AboutUs = () => {
  return (
    <div className="container py-5">
      {/* Heading */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">About Labour Connect</h1>
        <p className="lead text-muted">
          Empowering workers. Connecting contractors. Simplifying labour management.
        </p>
      </div>

      {/* About Section */}
      <div className="row align-items-center mb-5">
        <div className="col-md-6">
          <img
            src="/images/about-us.jpg" // Replace with your image path
            className="img-fluid rounded shadow w-100"
            alt="Labour Connect Platform"
          />
        </div>
        <hr></hr>
        <div className="col-md-6 w-100">
          <h3>Who We Are</h3>
          <p>
            Labour Connect is a modern labour management platform built to bridge the gap between skilled laborers and contractors. Whether you're a plumber, mason, electrician, or a builder – our platform helps you connect, work, and grow.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="row text-center mb-5">
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-success">Our Mission</h4>
              <p className="card-text">
                To digitize and streamline the process of labour hiring, promoting transparency, trust, and opportunity for every worker.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-info">Our Vision</h4>
              <p className="card-text">
                To become India's leading platform for labour and contractor management, recognized for trust, quality, and accessibility.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-5">
        <h3 className="mb-4">Why Choose Us?</h3>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">🔐 Verified Labour Profiles with Aadhar and Document Uploads</li>
          <li className="list-group-item">⭐ Rating and Review System with Admin Verification</li>
          <li className="list-group-item">🔍 Advanced Search & Filter by Skill, Price, Rating, and Availability</li>
          <li className="list-group-item">📞 Direct Contact via Calls or Messages</li>
          <li className="list-group-item">🌐 Multi-language Support – Hindi, Rajasthani, English</li>
          <li className="list-group-item">📸 Portfolio & Social Handles to Showcase Work</li>
        </ul>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h4>Want to know more or partner with us?</h4>
        <a href="/contact" className="btn btn-outline-primary mt-3 px-4">
          Contact Us
        </a>
      </div>
    </div>
  );
};

export default AboutUs;
