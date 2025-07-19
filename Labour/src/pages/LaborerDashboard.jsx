import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../Components/ToastContext';
import axiosInstance from '../utils/axiosInstance';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Modal, 
  Form,
  Tab,
  Tabs,
  Alert,
  Spinner,
  Table,
  Image,
  ProgressBar
} from 'react-bootstrap';

const LaborerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [jobRequests, setJobRequests] = useState([]);
  const [earnings, setEarnings] = useState({ total: 0, thisMonth: 0, thisWeek: 0 });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    skills: [],
    specialization: '',
    experience: '',
    hourlyRate: '',
    dailyRate: '',
    bio: '',
    availability: 'available'
  });

  // Document upload state
  const [documents, setDocuments] = useState({
    aadhar: null,
    idProof: null,
    workLicense: null,
    otherDocs: []
  });

  // Portfolio state
  const [portfolio, setPortfolio] = useState([]);
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    image: null,
    category: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        skills: user.skills || [],
        specialization: user.specialization || '',
        experience: user.experience || '',
        hourlyRate: user.hourlyRate || '',
        dailyRate: user.dailyRate || '',
        bio: user.bio || '',
        availability: user.availability || 'available'
      });
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [requestsRes, earningsRes] = await Promise.all([
          axiosInstance.get('/laborers/job-requests'),
          axiosInstance.get('/laborers/earnings')
        ]);
        
        setJobRequests(requestsRes.data.requests || []);
        setEarnings(earningsRes.data.earnings || { total: 0, thisMonth: 0, thisWeek: 0 });
      } else if (activeTab === 'portfolio') {
        const response = await axiosInstance.get('/laborers/portfolio');
        setPortfolio(response.data.portfolio || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showToast('Failed to load data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.put('/laborers/profile', profileForm);
      updateUser({ ...user, ...response.data.laborer });
      showToast('Profile updated successfully!', 'success');
      setShowProfileModal(false);
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    const newStatus = profileForm.availability === 'available' ? 'busy' : 'available';
    try {
      const response = await axiosInstance.put('/laborers/availability', { 
        availability: newStatus 
      });
      setProfileForm({ ...profileForm, availability: newStatus });
      updateUser({ ...user, availability: newStatus });
      showToast(`Status changed to ${newStatus}`, 'success');
    } catch (error) {
      showToast('Failed to update availability', 'danger');
    }
  };

  const handleJobAction = async (jobId, action) => {
    try {
      await axiosInstance.put(`/laborers/jobs/${jobId}/${action}`);
      showToast(`Job ${action}ed successfully`, 'success');
      loadDashboardData();
    } catch (error) {
      showToast(error.message || `Failed to ${action} job`, 'danger');
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          if (Array.isArray(documents[key])) {
            documents[key].forEach(doc => formData.append(key, doc));
          } else {
            formData.append(key, documents[key]);
          }
        }
      });

      const response = await axiosInstance.post('/laborers/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showToast('Documents uploaded successfully!', 'success');
      setShowDocumentModal(false);
      setDocuments({ aadhar: null, idProof: null, workLicense: null, otherDocs: [] });
    } catch (error) {
      showToast(error.message || 'Failed to upload documents', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioUpload = async (e) => {
    e.preventDefault();
    if (!newPortfolioItem.image) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newPortfolioItem.title);
      formData.append('description', newPortfolioItem.description);
      formData.append('category', newPortfolioItem.category);
      formData.append('image', newPortfolioItem.image);

      const response = await axiosInstance.post('/laborers/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setPortfolio([...portfolio, response.data.item]);
      setNewPortfolioItem({ title: '', description: '', image: null, category: '' });
      showToast('Portfolio item added successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to add portfolio item', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'pending': 'warning',
      'accepted': 'success',
      'rejected': 'danger',
      'completed': 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-warning' : 'text-muted'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>👷 Laborer Dashboard</h3>
        <div className="d-flex gap-2">
          <Button 
            variant={profileForm.availability === 'available' ? 'success' : 'warning'}
            onClick={handleAvailabilityToggle}
          >
            {profileForm.availability === 'available' ? '🟢 Available' : '🟡 Busy'}
          </Button>
          <Button variant="outline-primary" onClick={() => setShowProfileModal(true)}>
            📝 Edit Profile
          </Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="overview" title="📊 Overview">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Row>
              {/* Earnings Cards */}
              <Col md={4} className="mb-4">
                <Card className="text-center border-success">
                  <Card.Body>
                    <h4 className="text-success">₹{earnings.total}</h4>
                    <p className="text-muted mb-0">Total Earnings</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="text-center border-primary">
                  <Card.Body>
                    <h4 className="text-primary">₹{earnings.thisMonth}</h4>
                    <p className="text-muted mb-0">This Month</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="text-center border-info">
                  <Card.Body>
                    <h4 className="text-info">₹{earnings.thisWeek}</h4>
                    <p className="text-muted mb-0">This Week</p>
                  </Card.Body>
                </Card>
              </Col>

              {/* Job Requests */}
              <Col md={6} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">📋 Recent Job Requests</h5>
                  </Card.Header>
                  <Card.Body>
                    {jobRequests.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {jobRequests.slice(0, 5).map((job) => (
                          <div key={job._id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{job.title}</h6>
                                <p className="mb-1 text-muted">{job.description}</p>
                                <small className="text-muted">₹{job.budget} • {job.location}</small>
                              </div>
                              <div className="text-end">
                                {getStatusBadge(job.status)}
                                <div className="mt-2">
                                  {job.status === 'pending' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        variant="success" 
                                        className="me-1"
                                        onClick={() => handleJobAction(job._id, 'accept')}
                                      >
                                        ✅ Accept
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="danger"
                                        onClick={() => handleJobAction(job._id, 'reject')}
                                      >
                                        ❌ Reject
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert variant="info">No job requests yet.</Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Recent Reviews */}
              <Col md={6} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">⭐ Recent Reviews</h5>
                  </Card.Header>
                  <Card.Body>
                    {user?.reviews?.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {user.reviews.slice(0, 3).map((review, index) => (
                          <div key={index} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="mb-1">{getRatingStars(review.rating)}</div>
                                <p className="mb-1 small">{review.comment}</p>
                                <small className="text-muted">- {review.reviewerName}</small>
                              </div>
                              <small className="text-muted">{formatDate(review.date)}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert variant="info">No reviews yet.</Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>

        <Tab eventKey="jobs" title="💼 Job Requests">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Client</th>
                    <th>Budget</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobRequests.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <div>
                          <div className="fw-bold">{job.title}</div>
                          <small className="text-muted">{job.description}</small>
                        </div>
                      </td>
                      <td>{job.clientName}</td>
                      <td>₹{job.budget}</td>
                      <td>{job.location}</td>
                      <td>{getStatusBadge(job.status)}</td>
                      <td>{formatDate(job.createdAt)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => {
                              setSelectedJob(job);
                              setShowJobModal(true);
                            }}
                          >
                            👁️ View
                          </Button>
                          {job.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleJobAction(job._id, 'accept')}
                              >
                                ✅ Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleJobAction(job._id, 'reject')}
                              >
                                ❌ Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Tab>

        <Tab eventKey="portfolio" title="📸 Portfolio">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Work Portfolio</h5>
            <Button variant="primary" onClick={() => setShowPortfolioModal(true)}>
              ➕ Add Work
            </Button>
          </div>
          
          {portfolio.length > 0 ? (
            <Row>
              {portfolio.map((item, index) => (
                <Col key={index} md={4} className="mb-4">
                  <Card>
                    <Card.Img 
                      variant="top" 
                      src={item.imageUrl} 
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body>
                      <h6>{item.title}</h6>
                      <p className="text-muted small">{item.description}</p>
                      <Badge bg="primary">{item.category}</Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No portfolio items yet. Add your work to showcase your skills!
            </Alert>
          )}
        </Tab>

        <Tab eventKey="documents" title="📄 Documents">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Verification Documents</h5>
            <Button variant="primary" onClick={() => setShowDocumentModal(true)}>
              📤 Upload Documents
            </Button>
          </div>
          
          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>Required Documents</Card.Header>
                <Card.Body>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Aadhar Card
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      ID Proof
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Work License (if applicable)
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-plus-circle text-primary me-2"></i>
                      Other Documents
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>Verification Status</Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Document Verification</span>
                      <span>75%</span>
                    </div>
                    <ProgressBar now={75} variant="success" />
                  </div>
                  <Alert variant="warning">
                    <small>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Please upload all required documents for verification.
                    </small>
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Profile Edit Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📝 Edit Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleProfileUpdate}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Skills</Form.Label>
                  <Form.Control
                    type="text"
                    value={profileForm.skills.join(', ')}
                    onChange={(e) => setProfileForm({
                      ...profileForm, 
                      skills: e.target.value.split(',').map(s => s.trim())
                    })}
                    placeholder="Plumber, Electrician, etc."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Specialization</Form.Label>
                  <Form.Control
                    type="text"
                    value={profileForm.specialization}
                    onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})}
                    placeholder="Your main specialization"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Experience (Years)</Form.Label>
                  <Form.Control
                    type="number"
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                    placeholder="5"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hourly Rate (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    value={profileForm.hourlyRate}
                    onChange={(e) => setProfileForm({...profileForm, hourlyRate: e.target.value})}
                    placeholder="200"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Daily Rate (₹)</Form.Label>
              <Form.Control
                type="number"
                value={profileForm.dailyRate}
                onChange={(e) => setProfileForm({...profileForm, dailyRate: e.target.value})}
                placeholder="1500"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                placeholder="Tell clients about your experience and expertise..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Document Upload Modal */}
      <Modal show={showDocumentModal} onHide={() => setShowDocumentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📤 Upload Documents</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleDocumentUpload}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Aadhar Card</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setDocuments({...documents, aadhar: e.target.files[0]})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Proof</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setDocuments({...documents, idProof: e.target.files[0]})}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Work License (if applicable)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocuments({...documents, workLicense: e.target.files[0]})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Other Documents</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => setDocuments({...documents, otherDocs: Array.from(e.target.files)})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDocumentModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Documents'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Portfolio Upload Modal */}
      <Modal show={showPortfolioModal} onHide={() => setShowPortfolioModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📸 Add Portfolio Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePortfolioUpload}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newPortfolioItem.title}
                onChange={(e) => setNewPortfolioItem({...newPortfolioItem, title: e.target.value})}
                placeholder="Kitchen Plumbing Work"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                value={newPortfolioItem.description}
                onChange={(e) => setNewPortfolioItem({...newPortfolioItem, description: e.target.value})}
                placeholder="Describe the work you completed..."
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={newPortfolioItem.category}
                    onChange={(e) => setNewPortfolioItem({...newPortfolioItem, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="painting">Painting</option>
                    <option value="masonry">Masonry</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Work Photo</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPortfolioItem({...newPortfolioItem, image: e.target.files[0]})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPortfolioModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add to Portfolio'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Job Details Modal */}
      <Modal show={showJobModal} onHide={() => setShowJobModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📋 Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <div>
              <h5>{selectedJob.title}</h5>
              <p className="text-muted">{selectedJob.location}</p>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Budget:</strong> ₹{selectedJob.budget}
                </div>
                <div className="col-md-6">
                  <strong>Status:</strong> {getStatusBadge(selectedJob.status)}
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Description:</strong>
                <p>{selectedJob.description}</p>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Client:</strong> {selectedJob.clientName}
                </div>
                <div className="col-md-6">
                  <strong>Posted:</strong> {formatDate(selectedJob.createdAt)}
                </div>
              </div>
              
              {selectedJob.scheduledDate && (
                <div className="mb-3">
                  <strong>Scheduled Date:</strong> {formatDate(selectedJob.scheduledDate)}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJobModal(false)}>
            Close
          </Button>
          {selectedJob?.status === 'pending' && (
            <>
              <Button 
                variant="success"
                onClick={() => {
                  handleJobAction(selectedJob._id, 'accept');
                  setShowJobModal(false);
                }}
              >
                ✅ Accept Job
              </Button>
              <Button 
                variant="danger"
                onClick={() => {
                  handleJobAction(selectedJob._id, 'reject');
                  setShowJobModal(false);
                }}
              >
                ❌ Reject Job
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LaborerDashboard; 