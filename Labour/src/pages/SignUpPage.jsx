// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    emailOrPhone: '',
    password: '',
    role: '',
  });

  const roles = ['User', 'Laborer', 'Admin'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    const { fullName, emailOrPhone, password, role } = formData;
    if (!fullName || !emailOrPhone || !password || !role) {
      alert('Please fill all fields');
      return;
    }

    alert('Signup successful! Please verify OTP.');
    navigate('/otp-verification');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '85vh' }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: 500 }}>
        <h4 className="text-center mb-4">Sign Up</h4>
        <form onSubmit={handleSignup}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email or Phone</label>
            <input
              type="text"
              className="form-control"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              placeholder="Enter email or phone"
              required
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
            >
              <option value="">Choose your role</option>
              {roles.map((role, idx) => (
                <option key={idx} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="d-grid mb-2">
            <button type="submit" className="btn btn-success">Register</button>
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
