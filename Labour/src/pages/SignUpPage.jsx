// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'user', label: 'User' },
    { value: 'laborer', label: 'Laborer' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { name, email, phone, password, role } = formData;
      
      if (!name || !email || !phone || !password || !role) {
        setError('Please fill all fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate phone format (basic validation)
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        setError('Please enter a valid phone number');
        return;
      }

      const userData = {
        name,
        email,
        phone,
        password,
        role: role.toLowerCase()
      };

      const response = await authService.register(userData);
      
      if (response.user) {
        // Redirect based on user role
        if (response.user.role === 'laborer') {
          navigate('/laborer/dashboard');
        } else {
          navigate('/');
        }
      }
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
        
        <form onSubmit={handleSignup}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Create Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Select Role</label>
            <select
              className="form-select"
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
          </div>

          <div className="d-grid mb-2">
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
            >
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
