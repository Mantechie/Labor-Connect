// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleApiError } from '../utils/errorHandler';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
    setFieldError({ ...fieldError, [e.target.name]: '' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldError({});

    let errors = {};
    if (!credentials.email) errors.email = 'Email or phone is required';
    if (!credentials.password) errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) {
      setFieldError(errors);
      setLoading(false);
      return;
    }

    try {
      await login(credentials.email, credentials.password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      const errorInfo = handleApiError(error, 'Login');
      setError(errorInfo.userMessage);
      
      // Show additional help for CORS errors
      if (errorInfo.type === 'cors') {
        console.log('CORS Error Help:', {
          message: 'This appears to be a CORS/network issue.',
          suggestions: [
            'Check if the backend server is running',
            'Verify the API URL is correct',
            'Check your internet connection',
            'Try refreshing the page'
          ]
        });
      }
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
        <form onSubmit={handleLogin} autoComplete="off">
          <div className="form-floating mb-3">
            <input
              type="text"
              className={`form-control ${fieldError.email ? 'is-invalid' : ''}`}
              id="floatingEmail"
              name="email"
              placeholder="Email or Phone"
              value={credentials.email}
              onChange={handleInputChange}
              autoComplete="username"
              disabled={loading}
            />
            <label htmlFor="floatingEmail">Email or Phone</label>
            {fieldError.email && <div className="invalid-feedback">{fieldError.email}</div>}
          </div>
          <div className="mb-3 position-relative">
            <div className="form-floating">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${fieldError.password ? 'is-invalid' : ''}`}
                id="floatingPassword"
                name="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleInputChange}
                autoComplete="current-password"
                disabled={loading}
              />
              <label htmlFor="floatingPassword">Password</label>
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
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <small>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </small><br />
          <small>
            <Link to="/otp-login">Login with OTP</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
