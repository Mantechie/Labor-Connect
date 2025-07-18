// src/pages/OTPVerificationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutes
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  const formatTime = () => {
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      alert('OTP verified successfully!');
      navigate('/');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const handleResend = () => {
    setTimer(120);
    setIsResendDisabled(true);
    alert('OTP resent! Please check your phone or email.');
    // Here, trigger actual OTP send logic
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '85vh' }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: 400 }}>
        <h4 className="text-center mb-3">OTP Verification</h4>
        <p className="text-muted text-center">Enter the 6-digit OTP sent to your registered number/email.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control text-center fw-bold fs-4 mb-3"
            placeholder="Enter OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          />

          <div className="text-center mb-3">
            <small className="text-muted">OTP Expires in: <b>{formatTime()}</b></small>
          </div>

          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-primary">Verify OTP</button>
          </div>
        </form>

        <div className="text-center">
          <button
            className="btn btn-link"
            onClick={handleResend}
            disabled={isResendDisabled}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
