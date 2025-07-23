import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../Components/ToastContext';
import axiosInstance from '../utils/axiosInstance';
import { Card, Button, Form, Modal, Tab, Tabs, Badge, Alert } from 'react-bootstrap';
import ProfilePhotoUpload from '../Components/ProfilePhotoUpload';

const UserProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // History data
  const [postedJobs, setPostedJobs] = useState([]);
  const [hiredLabor, setHiredLabor] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  /* Profile photo
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      if (user.profilePhoto) {
        setPhotoPreview(user.profilePhoto);
      }
    }
  }, [user]); */

  const handlePhotoUpdate = async (file) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);

    const response = await axiosInstance.post('/users/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    updateUser({ ...user, profilePhoto: response.data.profilePhoto });
    updateUser({ ...user, profilePhoto: response.data.profilePhoto });
    return response;
  };
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.put('/users/profile', profileData);
      updateUser({ ...user, ...response.data.user });
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'danger');
    } finally {
      setLoading(false);
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

    setLoading(true);

    try {
      await axiosInstance.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      showToast('Password updated successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update password', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    setLoading(true);

    try {
      await axiosInstance.delete('/users/profile');
      logout();
      showToast('Profile deleted successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete profile', 'danger');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const loadJobHistory = async () => {
    setLoadingHistory(true);
    console.log('Loading job history for user:', user?.id);
    
    try {
      // Try to load posted jobs
      let jobsResponse;
      try {
        jobsResponse = await axiosInstance.get('/users/posted-jobs');
        console.log('Posted jobs response:', jobsResponse.data);
        setPostedJobs(jobsResponse.data.jobs || []);
      } catch (error) {
        console.log('Failed to load posted jobs:', error.response?.data || error.message);
        setPostedJobs([]);
      }

      // Try to load hired labor
      let hiresResponse;
      try {
        hiresResponse = await axiosInstance.get('/users/hired-labor');
        console.log('Hired labor response:', hiresResponse.data);
        setHiredLabor(hiresResponse.data.hires || []);
      } catch (error) {
        console.log('Failed to load hired labor:', error.response?.data || error.message);
        setHiredLabor([]);
      }

      // Only show error if both failed
      if (!jobsResponse && !hiresResponse) {
        showToast('Failed to load history data', 'warning');
      } else {
        console.log('History loaded successfully');
      }
    } catch (error) {
      console.error('History loading error:', error);
      showToast('Failed to load history', 'warning');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadJobHistory();
    }
  }, [activeTab]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      'pending': 'warning',
      'active': 'success',
      'completed': 'info',
      'cancelled': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3">
          {/* Enhanced Profile Card */}
          <Card className="text-center mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              {/* Profile Photo Upload Component */}
              <ProfilePhotoUpload
                currentPhoto={user?.profilePhoto}
                onPhotoUpdate={handlePhotoUpdate}
                loading={loading}
                setLoading={setLoading}
              />
              
              <h5 className="card-title mb-1">{user?.name}</h5>
              <p className="text-muted small mb-2">{user?.email}</p>
              <Badge bg={user?.role === 'admin' ? 'danger' : user?.role === 'laborer' ? 'warning' : 'primary'} className="px-3 py-2">
                {user?.role?.toUpperCase()}
              </Badge>
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-9">
          <Card>
            <Card.Body>
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Tab eventKey="profile" title="📋 Profile">
                  <Form onSubmit={handleProfileUpdate}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows="2"
                          value={profileData.address}
                          onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Profile'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline-warning"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        🔒 Change Password
                      </Button>
                    </div>
                  </Form>
                </Tab>

                <Tab eventKey="history" title="📊 History">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>📝 Posted Jobs</h6>
                      {loadingHistory ? (
                        <div className="text-center py-3">
                          <div className="spinner-border spinner-border-sm" role="status"></div>
                          <span className="ms-2">Loading...</span>
                        </div>
                      ) : postedJobs.length > 0 ? (
                        <div className="list-group">
                          {postedJobs.map((job) => (
                            <div key={job._id} className="list-group-item">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">{job.title}</h6>
                                  <p className="mb-1 text-muted">{job.description}</p>
                                  <small className="text-muted">
                                    Posted: {formatDate(job.createdAt)}
                                  </small>
                                </div>
                                {getStatusBadge(job.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Alert variant="info">
                          <i className="bi bi-info-circle me-2"></i>
                          No jobs posted yet. Start by posting your first job!
                        </Alert>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <h6>👷 Hired Labor</h6>
                      {loadingHistory ? (
                        <div className="text-center py-3">
                          <div className="spinner-border spinner-border-sm" role="status"></div>
                          <span className="ms-2">Loading...</span>
                        </div>
                      ) : hiredLabor.length > 0 ? (
                        <div className="list-group">
                          {hiredLabor.map((hire) => (
                            <div key={hire._id} className="list-group-item">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">{hire.laborerName}</h6>
                                  <p className="mb-1 text-muted">{hire.jobTitle}</p>
                                  <small className="text-muted">
                                    Hired: {formatDate(hire.hiredAt)}
                                  </small>
                                </div>
                                {getStatusBadge(hire.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Alert variant="info">
                          <i className="bi bi-info-circle me-2"></i>
                          No labor hired yet. Your hiring history will appear here!
                        </Alert>
                      )}
                    </div>
                  </div>
                  
                  {/* Help text for new users */}
                  <div className="mt-4">
                    <Alert variant="light" className="border-start border-primary border-4">
                      <h6 className="text-primary">💡 Getting Started</h6>
                      <p className="mb-2 small">
                        This section shows your job posting and hiring history. As you use the platform, your activity will appear here.
                      </p>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-primary" as="a" href="/job-post">
                          📝 Post a Job
                        </Button>
                        <Button size="sm" variant="outline-success" as="a" href="/browse-laborers">
                          🔍 Browse laborers
                        </Button>
                      </div>
                    </Alert>
                  </div>
                </Tab>

                <Tab eventKey="danger" title="⚠️ Danger Zone">
                  <Alert variant="danger">
                    <Alert.Heading>⚠️ Delete Account</Alert.Heading>
                    <p>
                      This action cannot be undone. This will permanently delete your account and remove all your data.
                    </p>
                    <hr />
                    <Button 
                      variant="outline-danger"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      🗑️ Delete My Account
                    </Button>
                  </Alert>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🔒 Change Password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordUpdate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🗑️ Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning!</strong> This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <p>Are you sure you want to delete your account?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProfile} disabled={loading}>
            {loading ? 'Deleting...' : 'Yes, Delete My Account'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserProfile; 