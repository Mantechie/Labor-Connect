// src/pages/OTPVerificationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0); // Start at 0, set when OTP is sent
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [contact, setContact] = useState('');
  const [contactError, setContactError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (otpSent) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(countdown);
  }, [timer, otpSent]);

  const formatTime = () => {
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setContactError('');
    setOtpError('');
    setOtp('');
    // Basic validation for email or phone
    if (!contact) {
      setContactError('Please enter your email or phone number');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[1-9][\d]{9,15}$/;
    if (!emailRegex.test(contact) && !phoneRegex.test(contact.replace(/\s/g, ''))) {
      setContactError('Enter a valid email or phone number');
      return;
    }
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setOtpSent(true);
      setTimer(120);
      setIsResendDisabled(true);
      setLoading(false);
      window.alert('OTP sent! Please check your phone or email.');
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOtpError('');
    if (otp.length === 6) {
      window.alert('OTP verified successfully!');
      navigate('/');
    } else {
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  const handleResend = () => {
    setTimer(120);
    setIsResendDisabled(true);
    setOtp('');
    setOtpError('');
    window.alert('OTP resent! Please check your phone or email.');
    // Here, trigger actual OTP send logic
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '85vh' }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: 400 }}>
        <h4 className="text-center mb-3">OTP Verification</h4>
        <p className="text-muted text-center">Enter your email or phone number to receive an OTP.</p>

        {/* Email/Phone input */}
        <form onSubmit={otpSent ? handleSubmit : handleSendOtp} autoComplete="off">
          <div className="form-floating mb-3">
            <input
              type="text"
              className={`form-control ${contactError ? 'is-invalid' : ''}`}
              id="floatingContact"
              placeholder="Email or Phone"
              value={contact}
              onChange={e => { setContact(e.target.value); setContactError(''); }}
              disabled={otpSent || loading}
            />
            <label htmlFor="floatingContact">Email or Phone</label>
            {contactError && <div className="invalid-feedback">{contactError}</div>}
          </div>

          {/* OTP input */}
          <input
            type="text"
            className={`form-control text-center fw-bold fs-4 mb-3 ${otpError ? 'is-invalid' : ''}`}
            placeholder="Enter OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            disabled={!otpSent || loading}
            autoComplete="one-time-code"
          />
          {otpError && <div className="invalid-feedback d-block text-center mb-2">{otpError}</div>}

          {/* Timer and buttons */}
          {otpSent && (
            <div className="text-center mb-3">
              <small className="text-muted">OTP Expires in: <b>{formatTime()}</b></small>
            </div>
          )}

          <div className="d-grid mb-3">
            {!otpSent ? (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Verify OTP
              </button>
            )}
          </div>
        </form>

        {otpSent && (
          <div className="text-center">
            <button
              className="btn btn-link"
              onClick={handleResend}
              disabled={isResendDisabled}
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPVerificationPage;
