// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { value: 'user', label: 'User' },
    { value: 'laborer', label: 'Laborer' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setFieldError({ ...fieldError, [e.target.name]: '' });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldError({});

    const { name, email, phone, password, role } = formData;
    let errors = {};
    if (!name) errors.name = 'Full name is required';
    if (!email) errors.email = 'Email is required';
    if (!phone) errors.phone = 'Phone number is required';
    if (!password) errors.password = 'Password is required';
    if (!role) errors.role = 'Role is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    // Validate phone format (basic validation)
    const phoneRegex = /^[+]?[1-9][\d]{9,15}$/;
    if (phone && !phoneRegex.test(phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (Object.keys(errors).length > 0) {
      setFieldError(errors);
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name,
        email,
        phone,
        password,
        role: role.toLowerCase()
      };
      await register(userData);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '85vh' }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: 500 }}>
        <h4 className="text-center mb-4">Sign Up</h4>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSignup} autoComplete="off">
          <div className="form-floating mb-3">
            <input
              type="text"
              className={`form-control ${fieldError.name ? 'is-invalid' : ''}`}
              id="floatingName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              disabled={loading}
            />
            <label htmlFor="floatingName">Full Name</label>
            {fieldError.name && <div className="invalid-feedback">{fieldError.name}</div>}
          </div>

          <div className="form-floating mb-3">
            <input
              type="email"
              className={`form-control ${fieldError.email ? 'is-invalid' : ''}`}
              id="floatingEmail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              disabled={loading}
            />
            <label htmlFor="floatingEmail">Email</label>
            {fieldError.email && <div className="invalid-feedback">{fieldError.email}</div>}
          </div>

          {/* Phone number input group (no floating label) */}
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <div className="input-group">
              <span className="input-group-text">+91</span>
              <input
                type="tel"
                className={`form-control ${fieldError.phone ? 'is-invalid' : ''}`}
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                disabled={loading}
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
              {fieldError.phone && <div className="invalid-feedback d-block">{fieldError.phone}</div>}
            </div>
          </div>

          <div className="mb-3 position-relative">
            <div className="form-floating">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${fieldError.password ? 'is-invalid' : ''}`}
                id="floatingPassword"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                disabled={loading}
              />
              <label htmlFor="floatingPassword">Create Password</label>
              {fieldError.password && <div className="invalid-feedback">{fieldError.password}</div>}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary position-absolute end-0 top-50 translate-middle-y me-2"
                style={{ zIndex: 2 }}
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-floating mb-3">
            <select
              className={`form-select ${fieldError.role ? 'is-invalid' : ''}`}
              id="floatingRole"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Choose your role</option>
              {roles.map((role, idx) => (
                <option key={idx} value={role.value}>{role.label}</option>
              ))}
            </select>
            <label htmlFor="floatingRole">Select Role</label>
            {fieldError.role && <div className="invalid-feedback">{fieldError.role}</div>}
          </div>

          <div className="d-grid mb-2">
            <button 
              type="submit" 
              className="btn btn-success d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <small>Already have an account? <a href="/login">Login</a></small>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
