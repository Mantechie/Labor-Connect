import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const categoryList = [
  { title: 'Mason (राज मिस्त्री)', img: 'https://cdn-icons-png.flaticon.com/128/7857/7857909.png' },
  { title: 'Construction Laborer (निर्माण मजदूर)', img: 'https://cdn-icons-png.flaticon.com/128/10036/10036255.png' },
  { title: 'Welder (वेल्डर)', img: 'https://cdn-icons-png.flaticon.com/128/9439/9439182.png' },
  { title: 'Electrician (बिजली मिस्त्री)', img: 'https://cdn-icons-png.flaticon.com/128/307/307943.png' },
  { title: 'Plumber (प्लंबर)', img: 'https://cdn-icons-png.flaticon.com/128/10365/10365972.png' },
  { title: 'Painter (पेंटर)', img: 'https://cdn-icons-png.flaticon.com/128/1995/1995491.png' },
  { title: 'Housekeeping Staff (सफाई कर्मचारी)', img: 'https://cdn-icons-png.flaticon.com/128/995/995066.png' },
  { title: 'Cook / Kitchen Helper', img: 'https://cdn-icons-png.flaticon.com/128/1830/1830839.png' },
  { title: 'Driver (ड्राइवर) – Commercial or Personal', img: 'https://cdn-icons-png.flaticon.com/128/4900/4900915.png' },
  { title: 'Caretaker / Watchman (चौकीदार)', img: 'https://cdn-icons-png.flaticon.com/128/10047/10047446.png' },
  { title: 'AC / Appliance Technician', img: 'https://cdn-icons-png.flaticon.com/128/9936/9936516.png' },
  { title: 'Gardener (माली)', img:'https://cdn-icons-png.flaticon.com/128/1544/1544052.png' },
  { title: 'Furniture Carpenter (बढ़ई)',  img: 'https://cdn-icons-png.flaticon.com/128/307/307963.png' },
  { title: 'Crane Operator', img: 'https://cdn-icons-png.flaticon.com/128/3129/3129531.png' },
];

const defaultIcon = 'https://cdn-icons-png.flaticon.com/512/2965/2965561.png';

// Fake laborers for demo
const fakeLaborers = [
  {
    _id: '1',
    name: 'Ramesh Kumar',
    specialization: 'Electrician',
    rating: 4.8,
    badge: 'Verified',
  },
  {
    _id: '2',
    name: 'Sita Devi',
    specialization: 'Plumber',
    rating: 4.6,
    badge: 'Top Rated',
  },
  {
    _id: '3',
    name: 'Rahul Singh',
    specialization: 'Mason',
    rating: 4.7,
    badge: 'Available',
  },
];

const testimonials = [
  {
    name: 'Amit Sharma',
    feedback: 'Found a great electrician in minutes! Very professional and quick service.',
    rating: 5,
  },
  {
    name: 'Priya Singh',
    feedback: 'The plumber was polite and fixed my issue perfectly. Highly recommend!',
    rating: 5,
  },
  {
    name: 'Ravi Kumar',
    feedback: 'Easy to use and trustworthy laborers. Will use again!',
    rating: 4,
  },
];

const HomePage = () => {
  const categories = categoryList;
  const [searchText, setSearchText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef(null);

  // Filter categories based on input
  const filteredCategories = searchText
    ? categories.filter(cat => cat.title.toLowerCase().includes(searchText.toLowerCase()))
    : categories;

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    setDropdownOpen(true);
    setHighlightIdx(-1);
  };

  const handleCategorySelect = (cat) => {
    setSearchText(cat.title);
    setDropdownOpen(false);
    setHighlightIdx(-1);
  };

  const handleInputFocus = () => {
    setDropdownOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setDropdownOpen(false), 120); // Delay to allow click
  };

  const handleKeyDown = (e) => {
    if (!dropdownOpen) return;
    if (e.key === 'ArrowDown') {
      setHighlightIdx(idx => Math.min(idx + 1, filteredCategories.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightIdx(idx => Math.max(idx - 1, 0));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      handleCategorySelect(filteredCategories[highlightIdx]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    alert(
      searchText
        ? `Searching for: ${searchText}`
        : 'Please type or select a category to search.'
    );
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section mb-5 text-center">
        <div className="container py-4">
          <h1 className="fw-bold mb-3" style={{ color: '#0D47A1', fontSize: '2.5rem' }}>
            Find Trusted Laborers Near You
          </h1>
          <p className="lead mb-4" style={{ color: '#333' }}>
            Quick, Verified, and Reliable Services for Every Home & Business
          </p>
          <form onSubmit={handleSearch} className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 mb-3">
            <div className="position-relative w-100" style={{ maxWidth: 500 }}>
              <input
                ref={inputRef}
                type="text"
                className="form-control"
                placeholder="Type or select a category..."
                value={searchText}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                style={{ minWidth: 0 }}
                autoComplete="off"
              />
              {dropdownOpen && filteredCategories.length > 0 && (
                <ul className="list-group position-absolute w-100 mt-1 shadow" style={{ zIndex: 2000, maxHeight: 260, overflowY: 'auto' }}>
                  {filteredCategories.map((cat, idx) => (
                    <li
                      key={cat.title}
                      className={`list-group-item list-group-item-action d-flex align-items-center gap-2${highlightIdx === idx ? ' active' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onMouseDown={() => handleCategorySelect(cat)}
                      onMouseEnter={() => setHighlightIdx(idx)}
                    >
                      <img src={cat.img || defaultIcon} alt="" style={{ width: 28, height: 28 }} />
                      <span>{cat.title}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button className="btn btn-primary position-absolute end-0 top-0 h-100 px-4" type="submit" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                Search
              </button>
            </div>
          </form>
          <div className="mb-2">
            <span className="trust-badge me-2">✅ Verified by Aadhaar</span>
            <span className="trust-badge bg-warning text-dark">🌟 Trusted by 10,000+ users</span>
          </div>
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
            <Link to="/job-post" className="btn btn-success rounded-pill px-4 fw-semibold">Post Your Work</Link>
            <Link to="/signup" className="btn btn-outline-primary rounded-pill px-4 fw-semibold">Join as Laborer</Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mb-5">
        <h4 className="mb-4 fw-semibold text-primary">Popular Categories</h4>
        <div className="row g-3">
          {categories.map((cat, idx) => (
            <div className="col-6 col-md-3 col-lg-2" key={idx}>
              <div className="category-card p-3 h-100 d-flex flex-column align-items-center justify-content-center">
                <img src={cat.img || defaultIcon} alt={cat.title} style={{ width: 60, height: 60 }} className="mb-2" />
                <h6 className="fw-bold mb-0 text-center" style={{ fontSize: '0.95rem' }}>{cat.title}</h6>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Laborers (Fake) */}
      <section className="container mb-5">
        <h4 className="mb-4 fw-semibold text-primary">Featured Laborers</h4>
        <div className="row g-3">
          {fakeLaborers.map((lab) => (
            <div className="col-md-4" key={lab._id}>
              <div className="card p-3 shadow-lg h-100 d-flex flex-column align-items-center">
                <h5 className="fw-bold mb-1">{lab.name}</h5>
                <span className="badge bg-success mb-1">{lab.specialization}</span>
                <span className="badge bg-info mb-1">{lab.badge}</span>
                <p className="mb-1">⭐ {lab.rating} / 5</p>
                <Link to={`/laborers/${lab._id}`} className="btn btn-sm btn-outline-primary rounded-pill mt-2">View Profile</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mb-5">
        <h4 className="mb-4 fw-semibold text-primary">What Our Users Say</h4>
        <div className="row g-3">
          {testimonials.map((t) => (
            <div className="col-md-4" key={t.name}>
              <div className="testimonial h-100">
                <div className="d-flex align-items-center mb-2">
                  {/* Avatar removed */}
                  <div>
                    <strong>{t.name}</strong>
                    <div style={{ color: '#FF9933' }}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                  </div>
                </div>
                <p className="mb-0">{t.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
