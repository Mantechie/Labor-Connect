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
  },
};

const LaborerProfile = () => {
  return (
    <div className="container py-5">
      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row align-items-start">
            <img
              src="/images/profile-placeholder.png"
              alt="Laborer"
              className="rounded me-md-4 mb-3 mb-md-0"
              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
            />
            <div>
              <h4>{laborer.name}</h4>
              <p className="mb-1 text-muted">{laborer.specialization}</p>
              <p className="mb-1"><strong>Location:</strong> {laborer.location}</p>
              <p className="mb-1"><strong>Rating:</strong> ⭐ {laborer.rating} ({laborer.reviews} reviews)</p>
              <p><strong>Status:</strong> {laborer.isAvailable ? '✅ Available' : '❌ Busy'}</p>
              <p>{laborer.description}</p>

              <div className="mt-3">
                <a href={`tel:${laborer.contact.phone}`} className="btn btn-primary me-2">Call Now</a>
                <a href="#message" className="btn btn-outline-primary">Message</a>
              </div>

              <div className="mt-3">
                <a href={laborer.social.facebook} target="_blank" rel="noreferrer" className="me-2 text-decoration-none">
                  📘 Facebook
                </a>
                <a href={laborer.social.instagram} target="_blank" rel="noreferrer" className="text-decoration-none">
                  📸 Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Work Gallery */}
          <div className="mt-4">
            <h5>Work Gallery</h5>
            <div className="row">
              {laborer.gallery.map((img, index) => (
                <div className="col-6 col-md-4 mb-3" key={index}>
                  <img src={img} alt={`Work ${index + 1}`} className="img-fluid rounded shadow-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaborerProfile;
