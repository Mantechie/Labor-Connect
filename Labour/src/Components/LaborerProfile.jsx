// src/components/LaborerProfile.jsx
import React from 'react';

const laborer = {
  name: 'Ramesh Kumar',
  specialization: 'Electrician',
  location: 'Jaipur, Rajasthan',
  rating: 4.6,
  reviews: 32,
  description: 'Experienced electrician with 7+ years of residential and commercial wiring work.',
  isAvailable: true,
  gallery: [
    '/images/work1.jpg',
    '/images/work2.jpg',
    '/images/work3.jpg',
  ],
  social: {
    facebook: 'https://facebook.com/rameshwork',
    instagram: 'https://instagram.com/rameshwork',
  },
  contact: {
    phone: '+91 9876543210',
    whatsapp: '919876543210',
  },
};

const starRating = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: '#FF9933', fontSize: '1.1rem' }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

const LaborerProfile = () => {
  return (
    <div className="container py-5">

      <div className="card shadow-lg rounded-2xl p-4">
        <div className="d-flex flex-column flex-md-row align-items-start gap-4">
          <img
            src="/images/profile-placeholder.png"
            alt="Laborer"
            className="rounded-circle border border-3 border-primary shadow mb-3 mb-md-0"
            style={{ width: '130px', height: '130px', objectFit: 'cover' }}
          />
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="fw-bold mb-0">{laborer.name}</h3>
              <span className="badge bg-success rounded-pill">{laborer.specialization}</span>
              {laborer.isAvailable ? (
                <span className="badge bg-success ms-2">Available</span>
              ) : (
                <span className="badge bg-danger ms-2">Busy</span>
              )}
            </div>
            <div className="mb-2 text-muted">
              <span className="me-3">📍 {laborer.location}</span>
              <span>{starRating(laborer.rating)} <span className="ms-1">({laborer.reviews} reviews)</span></span>
            </div>
            <p className="mb-2">{laborer.description}</p>
            <div className="d-flex flex-wrap gap-2 mb-2">
              <a href={`tel:${laborer.contact.phone}`} className="btn btn-primary rounded-pill d-flex align-items-center gap-2">
                <span>📞</span> <span>Call Now</span>
              </a>
              <a href={`https://wa.me/${laborer.contact.whatsapp}?text=Hi%20I%20found%20you%20on%20LabourConnect!`} target="_blank" rel="noreferrer" className="btn btn-success rounded-pill d-flex align-items-center gap-2">
                <span>💬</span> <span>WhatsApp</span>
              </a>
              <a href="#message" className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-2">
                <span>✉️</span> <span>Message</span>
              </a>
            </div>
            <div className="mt-2">
              <a href={laborer.social.facebook} target="_blank" rel="noreferrer" className="me-2 text-decoration-none">
                <span style={{ fontSize: '1.2rem' }}>📘</span> Facebook
              </a>
              <a href={laborer.social.instagram} target="_blank" rel="noreferrer" className="text-decoration-none">
                <span style={{ fontSize: '1.2rem' }}>📸</span> Instagram
              </a>
            </div>
          </div>
        </div>
        {/* Work Gallery */}
        <div className="mt-4">
          <h5 className="fw-semibold mb-3">Work Gallery</h5>
          <div className="row g-3">
            {laborer.gallery.map((img, index) => (
              <div className="col-6 col-md-4" key={index}>
                <img src={img} alt={`Work ${index + 1}`} className="img-fluid rounded shadow-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaborerProfile;
