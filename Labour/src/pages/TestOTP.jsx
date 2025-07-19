import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../Components/ToastContext';
import { Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import axiosInstance from '../utils/axiosInstance';
import AuthDebug from '../Components/AuthDebug';

const TestOTP = () => {
  const { sendOTP, verifyOTP } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('unknown');

  const checkBackendHealth = async () => {
    try {
      setBackendStatus('checking');
      const response = await axiosInstance.get('/health');
      console.log('Backend health check:', response.data);
      setBackendStatus('healthy');
      showToast('Backend is running!', 'success');
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('error');
      showToast('Backend is not responding', 'danger');
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email && !phone) {
      showToast('Please enter email or phone number', 'warning');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(email, phone);
      showToast('OTP sent successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to send OTP', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      showToast('Please enter OTP', 'warning');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, phone, otp);
      showToast('OTP verified successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to verify OTP', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (backendStatus) {
      case 'healthy':
        return <Badge bg="success">🟢 Backend Running</Badge>;
      case 'error':
        return <Badge bg="danger">🔴 Backend Down</Badge>;
      case 'checking':
        return <Badge bg="warning">🟡 Checking...</Badge>;
      default:
        return <Badge bg="secondary">⚪ Unknown</Badge>;
    }
  };

  return (
    <div className="container py-4">
      {/* Auth Debug Panel */}
      <AuthDebug />
      
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">🔧 Backend & OTP Test Page</h4>
            </Card.Header>
            <Card.Body>
              {/* Backend Health Check */}
              <div className="mb-4">
                <h6>🌐 Backend Status</h6>
                <div className="d-flex align-items-center gap-3 mb-2">
                  {getStatusBadge()}
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={checkBackendHealth}
                    disabled={backendStatus === 'checking'}
                  >
                    {backendStatus === 'checking' ? 'Checking...' : 'Check Backend'}
                  </Button>
                </div>
                <small className="text-muted">
                  This checks if the backend server is running and responding.
                </small>
              </div>

              <hr />

              {/* OTP Test Section */}
              <h6>📱 OTP Testing</h6>
              
              <Form onSubmit={handleSendOTP} className="mb-3">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading || (!email && !phone)}
                >
                  {loading ? 'Sending...' : '📤 Send OTP'}
                </Button>
              </Form>

              <Form onSubmit={handleVerifyOTP}>
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <Form.Label>OTP Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP code"
                      maxLength="6"
                    />
                  </div>
                  <div className="col-md-4 mb-3 d-flex align-items-end">
                    <Button 
                      type="submit" 
                      variant="success" 
                      disabled={loading || !otp}
                      className="w-100"
                    >
                      {loading ? 'Verifying...' : '✅ Verify OTP'}
                    </Button>
                  </div>
                </div>
              </Form>

              <Alert variant="info" className="mt-3">
                <h6>💡 Instructions:</h6>
                <ol className="mb-0">
                  <li>First check if the backend is running</li>
                  <li>Enter your email or phone number</li>
                  <li>Click "Send OTP" to receive a code</li>
                  <li>Enter the OTP code and verify</li>
                </ol>
              </Alert>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestOTP; 