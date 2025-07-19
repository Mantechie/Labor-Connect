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
  Table
} from 'react-bootstrap';

const JobManagement = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('posted');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [hiredLabor, setHiredLabor] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'posted') {
        const response = await axiosInstance.get('/users/posted-jobs');
        setJobs(response.data.jobs || []);
      } else if (activeTab === 'hired') {
        const response = await axiosInstance.get('/users/hired-labor');
        setHiredLabor(response.data.hires || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleJobStatusUpdate = async (jobId, newStatus) => {
    try {
      await axiosInstance.put(`/jobs/${jobId}/status`, { status: newStatus });
      showToast('Job status updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast(error.message || 'Failed to update job status', 'danger');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      await axiosInstance.post(`/laborers/${selectedJob.laborerId}/review`, reviewForm);
      showToast('Review submitted successfully', 'success');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      loadData();
    } catch (error) {
      showToast(error.message || 'Failed to submit review', 'danger');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'pending': 'warning',
      'active': 'success',
      'in_progress': 'info',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <h3>💼 Job Management</h3>
        <Button variant="primary" as="a" href="/job-post">
          📝 Post New Job
        </Button>
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="posted" title="📋 Posted Jobs">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : jobs.length > 0 ? (
            <Row>
              {jobs.map((job) => (
                <Col key={job._id} lg={6} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="card-title mb-1">{job.title}</h5>
                          <p className="text-muted mb-2">{job.location}</p>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                      
                      <p className="card-text">{job.description}</p>
                      
                      <div className="row mb-3">
                        <div className="col-6">
                          <small className="text-muted">Budget:</small>
                          <div className="fw-bold">₹{job.budget}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Posted:</small>
                          <div className="small">{formatDate(job.createdAt)}</div>
                        </div>
                      </div>

                      {job.assignedLaborer && (
                        <div className="mb-3 p-3 bg-light rounded">
                          <h6>👷 Assigned Laborer</h6>
                          <div className="d-flex align-items-center">
                            <img
                              src={job.laborerPhoto || 'https://via.placeholder.com/40?text=L'}
                              alt="Laborer"
                              className="rounded-circle me-2"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-bold">{job.laborerName}</div>
                              <div className="small text-muted">{job.laborerPhone}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setSelectedJob(job);
                            setShowJobModal(true);
                          }}
                        >
                          👁️ View Details
                        </Button>
                        
                        {job.status === 'pending' && (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleJobStatusUpdate(job._id, 'active')}
                            >
                              ✅ Activate
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleJobStatusUpdate(job._id, 'cancelled')}
                            >
                              ❌ Cancel
                            </Button>
                          </>
                        )}
                        
                        {job.status === 'active' && (
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleJobStatusUpdate(job._id, 'in_progress')}
                          >
                            🚀 Start Work
                          </Button>
                        )}
                        
                        {job.status === 'in_progress' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleJobStatusUpdate(job._id, 'completed')}
                          >
                            ✅ Mark Complete
                          </Button>
                        )}
                        
                        {job.status === 'completed' && job.assignedLaborer && (
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => {
                              setSelectedJob(job);
                              setShowReviewModal(true);
                            }}
                          >
                            ⭐ Leave Review
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No jobs posted yet. Start by posting your first job!
            </Alert>
          )}
        </Tab>

        <Tab eventKey="hired" title="👷 Hired Labor">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : hiredLabor.length > 0 ? (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Laborer</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Hired Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hiredLabor.map((hire) => (
                    <tr key={hire._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={hire.laborerPhoto || 'https://via.placeholder.com/40?text=L'}
                            alt="Laborer"
                            className="rounded-circle me-2"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold">{hire.laborerName}</div>
                            <div className="small text-muted">{hire.laborerPhone}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{hire.jobTitle}</div>
                          <div className="small text-muted">{hire.jobDescription}</div>
                        </div>
                      </td>
                      <td>{getStatusBadge(hire.status)}</td>
                      <td>{formatDate(hire.hiredAt)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            as="a"
                            href={`/chat?laborer=${hire.laborerId}`}
                          >
                            💬 Chat
                          </Button>
                          {hire.status === 'completed' && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => {
                                setSelectedJob(hire);
                                setShowReviewModal(true);
                              }}
                            >
                              ⭐ Review
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No labor hired yet. Your hiring history will appear here!
            </Alert>
          )}
        </Tab>
      </Tabs>

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
                  <strong>Status:</strong> {getStatusBadge(selectedJob.status)}
                </div>
                <div className="col-md-6">
                  <strong>Budget:</strong> ₹{selectedJob.budget}
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Description:</strong>
                <p>{selectedJob.description}</p>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Posted:</strong> {formatDate(selectedJob.createdAt)}
                </div>
                <div className="col-md-6">
                  <strong>Category:</strong> {selectedJob.category}
                </div>
              </div>
              
              {selectedJob.assignedLaborer && (
                <div className="p-3 bg-light rounded">
                  <h6>👷 Assigned Laborer</h6>
                  <div className="d-flex align-items-center">
                    <img
                      src={selectedJob.laborerPhoto || 'https://via.placeholder.com/60?text=L'}
                      alt="Laborer"
                      className="rounded-circle me-3"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-bold">{selectedJob.laborerName}</div>
                      <div className="text-muted">{selectedJob.laborerPhone}</div>
                      <div className="text-muted">{selectedJob.laborerEmail}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJobModal(false)}>
            Close
          </Button>
          {selectedJob?.assignedLaborer && (
            <Button 
              variant="primary"
              as="a"
              href={`/chat?laborer=${selectedJob.laborerId}`}
            >
              💬 Chat with Laborer
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>⭐ Leave Review</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReviewSubmit}>
          <Modal.Body>
            {selectedJob && (
              <div className="mb-3">
                <h6>Reviewing: {selectedJob.laborerName}</h6>
                <p className="text-muted">Job: {selectedJob.jobTitle || selectedJob.title}</p>
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`fs-4 me-1 cursor-pointer ${star <= reviewForm.rating ? 'text-warning' : 'text-muted'}`}
                    onClick={() => setReviewForm({...reviewForm, rating: star})}
                    style={{ cursor: 'pointer' }}
                  >
                    ★
                  </span>
                ))}
                <span className="ms-2">({reviewForm.rating}/5)</span>
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                placeholder="Share your experience with this laborer..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Review
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default JobManagement; 