import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../Components/ToastContext';

const OTPLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOTP, verifyOTP } = useAuth();
  const { showToast } = useToast();
  
  const [step, setStep] = useState('method'); // 'method', 'email', 'phone', or 'otp'
  const [selectedMethod, setSelectedMethod] = useState(''); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (selectedMethod === 'email' && !email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (selectedMethod === 'phone' && !phone) {
      setError('Please enter your phone number');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Frontend: Sending OTP request...');
      console.log('Email:', email);
      console.log('Phone:', phone);
      console.log('Selected method:', selectedMethod);
      
      const result = await sendOTP(email || null, phone || null);
      
      console.log('✅ Frontend: OTP sent successfully');
      console.log('Response:', result);
      
      // Show preview URL if available (development mode)
      if (result.previewUrl) {
        console.log('🔗 Email Preview URL:', result.previewUrl);
        showToast(`OTP sent! Check preview: ${result.previewUrl}`, 'success');
      } else {
        showToast('OTP sent successfully!', 'success');
      }
      
      setStep('otp');
      setCountdown(60); // Start 60 second countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('❌ Frontend: OTP error:', error);
      setError(error.message || 'Failed to send OTP');
      showToast(error.message || 'Failed to send OTP', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp) {
      setError('Please enter the OTP');
      setLoading(false);
      return;
    }

    try {
      await verifyOTP(email || null, phone || null, otp);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
      showToast('Login successful!', 'success');
    } catch (error) {
      setError(error.message || 'Invalid OTP');
      showToast(error.message || 'Invalid OTP', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');

    try {
      await sendOTP(email || null, phone || null);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      showToast('OTP resent successfully!', 'success');
    } catch (error) {
      setError(error.message || 'Failed to resend OTP');
      showToast(error.message || 'Failed to resend OTP', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep('method');
    setOtp('');
    setError('');
    setCountdown(0);
    setSelectedMethod('');
  };

  const selectMethod = (method) => {
    setSelectedMethod(method);
    setStep(method);
    setError('');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '85vh' }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: 400 }}>
        <h3 className="text-center mb-3">
          {step === 'method' ? '🔐 Choose Login Method' : 
           step === 'otp' ? '📱 Enter OTP' : 
           selectedMethod === 'email' ? '📧 Email OTP' : '📱 SMS OTP'}
        </h3>
        
        {/* Progress indicator */}
        {step !== 'method' && (
          <div className="progress mb-3" style={{ height: '4px' }}>
            <div 
              className="progress-bar bg-primary" 
              style={{ width: step === 'otp' ? '100%' : '50%' }}
            ></div>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {step === 'method' ? (
          <div className="text-center">
            <div className="row g-3">
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 py-3"
                  onClick={() => selectMethod('email')}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📧</div>
                  <strong>Email OTP</strong>
                  <div className="text-muted small">Send OTP to your email</div>
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 py-3"
                  onClick={() => selectMethod('phone')}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📱</div>
                  <strong>SMS OTP</strong>
                  <div className="text-muted small">Send OTP to your phone</div>
                </button>
              </div>
            </div>
          </div>
        ) : step === 'email' ? (
          <form onSubmit={handleSendOTP} autoComplete="off">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={loading}
                required
              />
            </div>

            <div className="d-grid mb-3">
              <button 
                type="submit" 
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                {loading ? 'Sending OTP...' : 'Send OTP to Email'}
              </button>
            </div>
          </form>
        ) : step === 'phone' ? (
          <form onSubmit={handleSendOTP} autoComplete="off">
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text">+91</span>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="d-grid mb-3">
              <button 
                type="submit" 
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                {loading ? 'Sending OTP...' : 'Send OTP to Phone'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} autoComplete="off">
            <div className="text-center mb-3">
              <p className="text-muted">
                OTP sent to: <strong>{selectedMethod === 'email' ? email : phone}</strong>
              </p>
              <small className="text-muted">
                via {selectedMethod === 'email' ? 'Email' : 'SMS'}
              </small>
            </div>
            
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">Enter OTP</label>
              <input
                type="text"
                className="form-control text-center"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                disabled={loading}
              />
            </div>

            <div className="d-grid mb-3">
              <button 
                type="submit" 
                className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="btn btn-link"
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-3">
          {step !== 'method' && (
            <button 
              type="button" 
              className="btn btn-link" 
              onClick={goBack}
              disabled={loading}
            >
              ← Back to Login Options
            </button>
          )}
        </div>
        
        <div className="text-center mt-2">
          <small>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default OTPLoginPage; 