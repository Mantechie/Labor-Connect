// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Dummy check – replace with API call later
    if (credentials.email && credentials.password) {
      alert('Login successful! Redirecting...');
      navigate('/');
    } else {
      alert('Please enter email and password');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '85vh' }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: 400 }}>
        <h3 className="text-center mb-3">Login</h3>
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
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Login</button>
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
