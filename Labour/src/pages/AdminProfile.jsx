import React, { useState, useEffect } from 'react';
import { useToast } from '../Components/ToastContext';
import adminAuthService from '../services/adminAuthService';
import adminAxiosInstance from '../utils/adminAxiosInstance';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  Spinner,
  Badge,
  Modal,
  Image,
  Table
} from 'react-bootstrap';

const AdminProfile = () => {
  const { showToast } = useToast();
  
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otherAdmins, setOtherAdmins] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [otpData, setOtpData] = useState({
    otp: '',
    operation: '' // 'profile' or 'password'
  });

  useEffect(() => {
    loadAdminProfile();
    loadOtherAdmins();
  }, []);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      const storedAdmin = adminAuthService.getStoredAdmin();
      
      if (!storedAdmin) {
        showToast('Admin not found. Please login again.', 'danger');
        window.location.href = '/admin/login';
        return;
      }

      setAdminUser(storedAdmin);
      setFormData({
        name: storedAdmin.name || '',
        email: storedAdmin.email || '',
        phone: storedAdmin.phone || '',
        department: storedAdmin.department || '',
        role: storedAdmin.role || ''
      });
    } catch (error) {
      console.error('Error loading admin profile:', error);
      showToast('Failed to load profile', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadOtherAdmins = async () => {
    try {
      const response = await adminAxiosInstance.get('/admin/auth/collaborators');
      setOtherAdmins(response.data.admins || []);
    } catch (error) {
      console.error('Error loading other admins:', error);
      // Set default data if API fails
      setOtherAdmins([
        {
          id: '1',
          name: 'System Administrator',
          email: 'admin@labourconnect.com',
          phone: '9876543210',
          role: 'super_admin',
          department: 'general',
          isActive: true,
          lastLogin: new Date().toISOString()
        }
      ]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleOTPChange = (e) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value
    });
  };

  const generateOTP = async (operation) => {
    try {
      await adminAxiosInstance.post('/admin/auth/generate-otp');
      setOtpData({ otp: '', operation });
      setShowOTPModal(true);
      showToast('OTP sent to your email. Please check and enter it.', 'info');
    } catch (error) {
      console.error('Error generating OTP:', error);
      showToast(error.response?.data?.message || 'Failed to generate OTP', 'danger');
    }
  };

  const verifyOTP = async () => {
    if (!otpData.otp) {
      showToast('Please enter OTP', 'warning');
      return;
    }

    try {
      setSaving(true);
      
      if (otpData.operation === 'profile') {
        const response = await adminAxiosInstance.put('/admin/auth/profile', {
          ...formData,
          otp: otpData.otp
        });
        
        // Update stored admin data
        const updatedAdmin = { ...adminUser, ...formData };
        localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));
        setAdminUser(updatedAdmin);
        
        showToast('Profile updated successfully!', 'success');
      } else if (otpData.operation === 'password') {
        const response = await adminAxiosInstance.put('/admin/auth/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          otp: otpData.otp
        });
        
        showToast('Password changed successfully! Please login again.', 'success');
        setShowChangePasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect to login since password change forces logout
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      }
      
      setShowOTPModal(false);
      setOtpData({ otp: '', operation: '' });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      if (error.response?.data?.message === 'Invalid OTP') {
        showToast('Invalid OTP. Please check and try again.', 'danger');
      } else if (error.response?.data?.message === 'OTP expired or not found') {
        showToast('OTP has expired. Please try the operation again.', 'danger');
        setShowOTPModal(false);
        setOtpData({ otp: '', operation: '' });
      } else {
        showToast(error.response?.data?.message || 'Failed to verify OTP', 'danger');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await adminAxiosInstance.put('/admin/auth/profile', formData);
      
      // Check if OTP is required
      if (response.data.requiresOTP) {
        setOtpData({ otp: '', operation: 'profile' });
        setShowOTPModal(true);
        showToast('OTP sent to your email and phone. Please enter it to complete the update.', 'info');
        setSaving(false);
        return;
      }
      
      // Update stored admin data
      const updatedAdmin = { ...adminUser, ...formData };
      localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));
      setAdminUser(updatedAdmin);
      
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.requiresOTP) {
        setOtpData({ otp: '', operation: 'profile' });
        setShowOTPModal(true);
        showToast('OTP sent to your email and phone. Please enter it to complete the update.', 'info');
      } else {
        showToast(error.response?.data?.message || 'Failed to update profile', 'danger');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'danger');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'danger');
      return;
    }

    setSaving(true);

    try {
      const response = await adminAxiosInstance.put('/admin/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Check if OTP is required
      if (response.data.requiresOTP) {
        setOtpData({ otp: '', operation: 'password' });
        setShowOTPModal(true);
        showToast('OTP sent to your email and phone. Please enter it to complete the password change.', 'info');
        setSaving(false);
        return;
      }
      
      showToast('Password changed successfully! Please login again.', 'success');
      setShowChangePasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Redirect to login since password change forces logout
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data?.requiresOTP) {
        setOtpData({ otp: '', operation: 'password' });
        setShowOTPModal(true);
        showToast('OTP sent to your email and phone. Please enter it to complete the password change.', 'info');
      } else {
        showToast(error.response?.data?.message || 'Failed to change password', 'danger');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showToast('File size must be less than 5MB', 'danger');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await adminAxiosInstance.put('/admin/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update stored admin data
      const updatedAdmin = { ...adminUser, profilePicture: response.data.profilePicture };
      localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));
      setAdminUser(updatedAdmin);
      
      showToast('Profile picture updated successfully!', 'success');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showToast(error.response?.data?.message || 'Failed to upload profile picture', 'danger');
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      'super_admin': 'danger',
      'admin': 'primary',
      'moderator': 'warning'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <Badge bg="success">Active</Badge> : 
      <Badge bg="danger">Inactive</Badge>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="admin-profile-page" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container fluid className="py-4">
        <Row>
          <Col lg={8} className="mx-auto">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">👤 Admin Profile</h2>
              <Button 
                variant="outline-primary" 
                onClick={() => setShowCollaborationModal(true)}
              >
                👥 View Collaborators ({otherAdmins.length})
              </Button>
            </div>

            <Row>
              {/* Profile Picture Section */}
              <Col md={4} className="mb-4">
                <Card className="text-center">
                  <Card.Body>
                    <div className="position-relative mb-3">
                      <Image
                        src={adminUser?.profilePicture || 'https://via.placeholder.com/150/007bff/ffffff?text=Admin'}
                        alt="Admin Profile"
                        roundedCircle
                        width={150}
                        height={150}
                        className="border border-3 border-primary"
                      />
                      <div className="position-absolute bottom-0 end-0">
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          style={{ display: 'none' }}
                          id="profile-picture-upload"
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => document.getElementById('profile-picture-upload').click()}
                        >
                          📷
                        </Button>
                      </div>
                    </div>
                    <h5 className="mb-1">{adminUser?.name}</h5>
                    <p className="text-muted mb-2">{adminUser?.email}</p>
                    {getRoleBadge(adminUser?.role)}
                    <div className="mt-2">
                      {getStatusBadge(adminUser?.isActive)}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Profile Details Section */}
              <Col md={8}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">📋 Profile Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleProfileUpdate}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                            <Form.Control
                              type="text"
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                          type="text"
                          name="role"
                          value={formData.role}
                          readOnly
                          className="bg-light"
                        />
                        <Form.Text className="text-muted">
                          Role cannot be changed. Contact super admin for role changes.
                        </Form.Text>
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button type="submit" variant="primary" disabled={saving}>
                          {saving ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Saving...
                            </>
                          ) : (
                            '💾 Save Changes'
                          )}
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setShowChangePasswordModal(true)}
                        >
                          🔐 Change Password
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Change Password Modal */}
      <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🔐 Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePasswordUpdate} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Collaboration Modal */}
      <Modal 
        show={showCollaborationModal} 
        onHide={() => setShowCollaborationModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>👥 Admin Collaboration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>Collaboration System:</strong> This platform supports up to 2 active administrators for optimal collaboration and security.
          </Alert>
          
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {otherAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <Image
                        src={admin.profilePicture || 'https://via.placeholder.com/32/007bff/ffffff?text=A'}
                        roundedCircle
                        width={32}
                        height={32}
                        className="me-2"
                      />
                      {admin.name}
                    </div>
                  </td>
                  <td>{admin.email}</td>
                  <td>{getRoleBadge(admin.role)}</td>
                  <td>{getStatusBadge(admin.isActive)}</td>
                  <td>
                    {admin.lastLogin ? 
                      new Date(admin.lastLogin).toLocaleDateString() : 
                      'Never'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCollaborationModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal show={showOTPModal} onHide={() => setShowOTPModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🔐 OTP Verification Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <div className="mb-3">
              <i className="fas fa-shield-alt text-primary" style={{ fontSize: '3rem' }}></i>
            </div>
            <h5>Security Verification</h5>
            <p className="text-muted">
              An OTP has been sent to your email and phone number for verification.
            </p>
            <p className="text-muted small">
              This ensures that only you can make changes to your admin account.
            </p>
          </div>
          <Form.Group className="mb-3">
            <Form.Label>Enter 6-digit OTP</Form.Label>
            <Form.Control
              type="text"
              name="otp"
              value={otpData.otp}
              onChange={handleOTPChange}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="text-center"
              style={{ fontSize: '1.2rem', letterSpacing: '0.5rem' }}
              required
            />
            <Form.Text className="text-muted">
              Check your email and phone for the OTP code
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOTPModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={verifyOTP} disabled={saving || !otpData.otp}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Verifying...
              </>
            ) : (
              'Verify & Complete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminProfile; 