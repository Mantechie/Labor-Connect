// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!credentials.email || !credentials.password) {
        setError('Please enter both email and password');
        return;
      }

      const response = await authService.login(credentials.email, credentials.password);
      
      if (response.user) {
        // Redirect based on user role
        if (response.user.role === 'laborer') {
          navigate('/laborer/dashboard');
        } else if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '85vh' }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: 400 }}>
        <h3 className="text-center mb-3">Login</h3>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email or Phone</label>
            <input
              type="text"
              className="form-control"
              id="email"
              name="email"
              placeholder="Enter email or phone"
              value={credentials.email}
              onChange={handleInputChange}
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Enter password"
              value={credentials.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="text-center mt-3">
          <small>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </small><br />
          <small>
            <Link to="/otp-verification">Login with OTP</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
