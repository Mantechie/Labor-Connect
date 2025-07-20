import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../Components/ToastContext';
import adminAuthService from '../services/adminAuthService';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  Spinner
} from 'react-bootstrap';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If admin is already logged in, redirect to admin dashboard
    const checkAdminAuth = async () => {
      try {
        const isValid = await adminAuthService.validateToken();
        if (isValid) {
          const from = location.state?.from?.pathname || '/admin/dashboard';
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.error('Admin auth check error:', error);
      }
    };

    checkAdminAuth();
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminAuthService.login(formData.email, formData.password);
      
      showToast('Admin login successful!', 'success');
      
      // Redirect to the intended destination or admin dashboard
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message || 'Login failed');
      showToast(error.message || 'Login failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="admin-login-page" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
                  <h2 className="fw-bold text-dark mb-2">Admin Login</h2>
                  <p className="text-muted">Access the admin dashboard</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@labourconnect.com"
                      required
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      className="py-2"
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 py-2 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Logging in...
                      </>
                    ) : (
                      '🔐 Login to Admin Dashboard'
                    )}
                  </Button>
                </Form>

                <div className="text-center">
                  <small className="text-muted">
                    🔒 Secure admin access only
                  </small>
                </div>
              </Card.Body>
            </Card>

            <div className="text-center mt-4">
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={() => navigate('/')}
              >
                ← Back to Main Site
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin; 