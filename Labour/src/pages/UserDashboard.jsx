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
  ProgressBar
} from 'react-bootstrap';

const UserDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [postedJobs, setPostedJobs] = useState([]);
  const [hiredLaborers, setHiredLaborers] = useState([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedLaborer, setSelectedLaborer] = useState(null);
  
  // Job posting form state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    budget: '',
    location: '',
    category: '',
    scheduledDate: '',
    urgency: 'normal'
  });

  // Hire laborer form state
  const [hireForm, setHireForm] = useState({
    message: '',
    scheduledDate: '',
    budget: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [jobsRes, laborersRes] = await Promise.all([
          axiosInstance.get('/users/posted-jobs'),
          axiosInstance.get('/users/hired-laborers')
        ]);
        
        setPostedJobs(jobsRes.data.jobs || []);
        setHiredLaborers(laborersRes.data.laborers || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showToast('Failed to load data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleJobPost = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/jobs', jobForm);
      showToast('Job posted successfully!', 'success');
      setShowJobModal(false);
      setJobForm({
        title: '',
        description: '',
        budget: '',
        location: '',
        category: '',
        scheduledDate: '',
        urgency: 'normal'
      });
      loadDashboardData();
    } catch (error) {
      showToast(error.message || 'Failed to post job', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleHireLaborer = async (e) => {
    e.preventDefault();
    if (!selectedLaborer) return;

    setLoading(true);
    try {
      await axiosInstance.post('/jobs/hire-laborer', {
        laborerId: selectedLaborer._id,
        jobTitle: hireForm.message,
        description: `Direct hire request for ${selectedLaborer.name}`,
        budget: hireForm.budget,
        location: user.location,
        scheduledDate: hireForm.scheduledDate,
        message: hireForm.message
      });
      
      showToast('Hire request sent successfully!', 'success');
      setShowHireModal(false);
      setHireForm({ message: '', scheduledDate: '', budget: '' });
      setSelectedLaborer(null);
      loadDashboardData();
    } catch (error) {
      showToast(error.message || 'Failed to send hire request', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleJobAction = async (jobId, action) => {
    try {
      await axiosInstance.put(`/jobs/${jobId}/${action}`);
      showToast(`Job ${action}ed successfully`, 'success');
      loadDashboardData();
    } catch (error) {
      showToast(error.message || `Failed to ${action} job`, 'danger');
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUrgencyBadge = (urgency) => {
    const variants = {
      'low': 'success',
      'normal': 'primary',
      'high': 'warning',
      'urgent': 'danger'
    };
    return <Badge bg={variants[urgency] || 'secondary'}>{urgency}</Badge>;
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>🏠 User Dashboard</h3>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setShowJobModal(true)}>
            ➕ Post New Job
          </Button>
          <Button variant="primary" as="a" href="/browse-laborers">
            👷 Find Laborers
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
              {/* Stats Cards */}
              <Col md={4} className="mb-4">
                <Card className="text-center border-primary">
                  <Card.Body>
                    <h4 className="text-primary">{postedJobs.length}</h4>
                    <p className="text-muted mb-0">Posted Jobs</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="text-center border-success">
                  <Card.Body>
                    <h4 className="text-success">{hiredLaborers.length}</h4>
                    <p className="text-muted mb-0">Hired Laborers</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="text-center border-warning">
                  <Card.Body>
                    <h4 className="text-warning">
                      {postedJobs.filter(job => job.status === 'completed').length}
                    </h4>
                    <p className="text-muted mb-0">Completed Jobs</p>
                  </Card.Body>
                </Card>
              </Col>

              {/* Recent Posted Jobs */}
              <Col md={8} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">📋 Recent Posted Jobs</h5>
                  </Card.Header>
                  <Card.Body>
                    {postedJobs.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {postedJobs.slice(0, 5).map((job) => (
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
                                  <Button 
                                    size="sm" 
                                    variant="outline-primary" 
                                    className="me-1"
                                    onClick={() => {
                                      setSelectedJob(job);
                                      setShowJobModal(true);
                                    }}
                                  >
                                    ✏️ Edit
                                  </Button>
                                  {job.status === 'active' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline-success"
                                      onClick={() => handleJobAction(job._id, 'complete')}
                                    >
                                      ✅ Complete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        No jobs posted yet. Post your first job to get started!
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Hired Laborers */}
              <Col md={4} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">👷 Hired Laborers</h5>
                  </Card.Header>
                  <Card.Body>
                    {hiredLaborers.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {hiredLaborers.slice(0, 3).map((laborer) => (
                          <div key={laborer._id} className="list-group-item">
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <img 
                                  src={laborer.profilePhoto || '/default-avatar.png'} 
                                  alt={laborer.name}
                                  className="rounded-circle"
                                  width="40"
                                  height="40"
                                />
                              </div>
                              <div>
                                <h6 className="mb-1">{laborer.name}</h6>
                                <small className="text-muted">{laborer.specialization}</small>
                                <div className="mt-1">
                                  <span className="text-warning">★</span>
                                  <span className="small">{laborer.rating || 'No rating'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        No laborers hired yet. Browse and hire skilled laborers!
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>

        <Tab eventKey="jobs" title="💼 My Posted Jobs">
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
                    <th>Category</th>
                    <th>Budget</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Posted Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postedJobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <div>
                          <div className="fw-bold">{job.title}</div>
                          <small className="text-muted">{job.description}</small>
                        </div>
                      </td>
                      <td>{job.category}</td>
                      <td>₹{job.budget}</td>
                      <td>{job.location}</td>
                      <td>{getStatusBadge(job.status)}</td>
                      <td>{getUrgencyBadge(job.urgency)}</td>
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
                          {job.status === 'active' && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleJobAction(job._id, 'complete')}
                              >
                                ✅ Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleJobAction(job._id, 'cancel')}
                              >
                                ❌ Cancel
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

        <Tab eventKey="laborers" title="👷 Hired Laborers">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Your Hired Laborers</h5>
            <Button variant="primary" as="a" href="/browse-laborers">
              🔍 Find More Laborers
            </Button>
          </div>
          
          {hiredLaborers.length > 0 ? (
            <Row>
              {hiredLaborers.map((laborer) => (
                <Col key={laborer._id} md={6} lg={4} className="mb-4">
                  <Card>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <img 
                          src={laborer.profilePhoto || '/default-avatar.png'} 
                          alt={laborer.name}
                          className="rounded-circle me-3"
                          width="60"
                          height="60"
                        />
                        <div>
                          <h5 className="mb-1">{laborer.name}</h5>
                          <p className="text-muted mb-0">{laborer.specialization}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Rating</span>
                          <span>{laborer.rating || 'No rating'}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Experience</span>
                          <span>{laborer.experience || 'N/A'} years</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Rate</span>
                          <span>₹{laborer.hourlyRate || laborer.dailyRate || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          as="a" 
                          href={`/chat?user=${laborer._id}`}
                        >
                          💬 Chat
                        </Button>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => {
                            setSelectedLaborer(laborer);
                            setShowHireModal(true);
                          }}
                        >
                          ➕ Hire Again
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No laborers hired yet. Browse our skilled laborers and hire them for your work!
            </Alert>
          )}
        </Tab>
      </Tabs>

      {/* Job Posting Modal */}
      <Modal show={showJobModal} onHide={() => setShowJobModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedJob ? '✏️ Edit Job' : '➕ Post New Job'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleJobPost}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                    placeholder="e.g., Need a plumber for bathroom repair"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={jobForm.category}
                    onChange={(e) => setJobForm({...jobForm, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="painting">Painting</option>
                    <option value="masonry">Masonry</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                value={jobForm.description}
                onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                placeholder="Describe the work you need in detail..."
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Budget (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    value={jobForm.budget}
                    onChange={(e) => setJobForm({...jobForm, budget: e.target.value})}
                    placeholder="1500"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                    placeholder="Your address or area"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Scheduled Date (Optional)</Form.Label>
                  <Form.Control
                    type="date"
                    value={jobForm.scheduledDate}
                    onChange={(e) => setJobForm({...jobForm, scheduledDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Urgency</Form.Label>
                  <Form.Select
                    value={jobForm.urgency}
                    onChange={(e) => setJobForm({...jobForm, urgency: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowJobModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Posting...' : (selectedJob ? 'Update Job' : 'Post Job')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Hire Laborer Modal */}
      <Modal show={showHireModal} onHide={() => setShowHireModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>👷 Hire {selectedLaborer?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleHireLaborer}>
          <Modal.Body>
            {selectedLaborer && (
              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <img 
                    src={selectedLaborer.profilePhoto || '/default-avatar.png'} 
                    alt={selectedLaborer.name}
                    className="rounded-circle me-3"
                    width="50"
                    height="50"
                  />
                  <div>
                    <h6 className="mb-1">{selectedLaborer.name}</h6>
                    <p className="text-muted mb-0">{selectedLaborer.specialization}</p>
                    <small className="text-muted">Rating: {selectedLaborer.rating || 'No rating'}</small>
                  </div>
                </div>
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Message to Laborer</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                value={hireForm.message}
                onChange={(e) => setHireForm({...hireForm, message: e.target.value})}
                placeholder="Describe the work you need..."
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Budget (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    value={hireForm.budget}
                    onChange={(e) => setHireForm({...hireForm, budget: e.target.value})}
                    placeholder="1500"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Scheduled Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={hireForm.scheduledDate}
                    onChange={(e) => setHireForm({...hireForm, scheduledDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowHireModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Hire Request'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDashboard; 