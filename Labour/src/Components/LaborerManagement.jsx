import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Modal, 
  Form,
  Table,
  Spinner,
  Alert,
  Dropdown,
  Pagination,
  InputGroup,
  FormControl,
  DropdownButton,
  ProgressBar
} from 'react-bootstrap';
import { useToast } from './ToastContext';
import adminAxiosInstance from '../utils/adminAxiosInstance';

const LaborerManagement = () => {
  const { showToast } = useToast();
  
  const [laborers, setLaborers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    verified: 0,
    unverified: 0,
    available: 0,
    unavailable: 0
  });
  const [specializationStats, setSpecializationStats] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLaborers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    specialization: '',
    verified: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedLaborers, setSelectedLaborers] = useState([]);
  const [showLaborerModal, setShowLaborerModal] = useState(false);
  const [selectedLaborer, setSelectedLaborer] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    reason: ''
  });
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    isVerified: false,
    reason: ''
  });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({
    status: '',
    reason: ''
  });
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    loadLaborers();
    loadSpecializations();
  }, [filters, pagination.currentPage]);

  const loadLaborers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        search: filters.search,
        status: filters.status,
        specialization: filters.specialization,
        verified: filters.verified,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await adminAxiosInstance.get(`/admin/laborers?${params}`);
      
      setLaborers(response.data.laborers);
      setPagination(response.data.pagination);
      setStats(response.data.stats);
      setSpecializationStats(response.data.specializationStats || []);
    } catch (error) {
      console.error('Error loading laborers:', error);
      showToast('Failed to load laborers', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecializations = async () => {
    try {
      const response = await adminAxiosInstance.get('/admin/laborers/specializations');
      setSpecializations(response.data.specializations || []);
    } catch (error) {
      console.error('Error loading specializations:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSpecializationFilter = (specialization) => {
    setFilters(prev => ({ ...prev, specialization }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleVerificationFilter = (verified) => {
    setFilters(prev => ({ ...prev, verified }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSort = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleLaborerSelect = (laborerId) => {
    setSelectedLaborers(prev => 
      prev.includes(laborerId) 
        ? prev.filter(id => id !== laborerId)
        : [...prev, laborerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLaborers.length === laborers.length) {
      setSelectedLaborers([]);
    } else {
      setSelectedLaborers(laborers.map(laborer => laborer._id));
    }
  };

  const handleViewLaborer = async (laborer) => {
    try {
      const response = await adminAxiosInstance.get(`/admin/laborers/${laborer._id}`);
      setSelectedLaborer(response.data.laborer);
      setShowLaborerModal(true);
    } catch (error) {
      console.error('Error loading laborer details:', error);
      showToast('Failed to load laborer details', 'danger');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await adminAxiosInstance.put(`/admin/laborers/${selectedLaborer._id}/status`, statusData);
      
      showToast('Laborer status updated successfully', 'success');
      setShowStatusModal(false);
      setStatusData({ status: '', reason: '' });
      loadLaborers();
    } catch (error) {
      console.error('Error updating laborer status:', error);
      showToast(error.response?.data?.message || 'Failed to update laborer status', 'danger');
    }
  };

  const handleUpdateVerification = async () => {
    try {
      await adminAxiosInstance.put(`/admin/laborers/${selectedLaborer._id}/verify`, verificationData);
      
      showToast(`Laborer ${verificationData.isVerified ? 'verified' : 'unverified'} successfully`, 'success');
      setShowVerificationModal(false);
      setVerificationData({ isVerified: false, reason: '' });
      loadLaborers();
    } catch (error) {
      console.error('Error updating laborer verification:', error);
      showToast(error.response?.data?.message || 'Failed to update laborer verification', 'danger');
    }
  };

  const handleBulkUpdate = async () => {
    try {
      await adminAxiosInstance.put('/admin/laborers/bulk-status', {
        laborerIds: selectedLaborers,
        ...bulkData
      });
      
      showToast(`Successfully updated ${selectedLaborers.length} laborers`, 'success');
      setShowBulkModal(false);
      setBulkData({ status: '', reason: '' });
      setSelectedLaborers([]);
      loadLaborers();
    } catch (error) {
      console.error('Error bulk updating laborers:', error);
      showToast(error.response?.data?.message || 'Failed to bulk update laborers', 'danger');
    }
  };

  const handleDeleteLaborer = async (laborerId) => {
    if (!window.confirm('Are you sure you want to delete this laborer?')) {
      return;
    }

    try {
      await adminAxiosInstance.delete(`/admin/laborers/${laborerId}`);
      showToast('Laborer deleted successfully', 'success');
      loadLaborers();
    } catch (error) {
      console.error('Error deleting laborer:', error);
      showToast(error.response?.data?.message || 'Failed to delete laborer', 'danger');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'inactive': 'warning',
      'suspended': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getVerificationBadge = (isVerified) => {
    return isVerified ? 
      <Badge bg="success">Verified</Badge> : 
      <Badge bg="warning">Unverified</Badge>;
  };

  const getAvailabilityBadge = (isAvailable) => {
    return isAvailable ? 
      <Badge bg="success">Available</Badge> : 
      <Badge bg="secondary">Unavailable</Badge>;
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    
    return stars.join('') + ` (${rating.toFixed(1)})`;
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

  return (
    <div className="laborer-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🔧 Laborer Management</h2>
        <div className="d-flex gap-2">
          {selectedLaborers.length > 0 && (
            <Button 
              variant="outline-primary" 
              onClick={() => setShowBulkModal(true)}
            >
              📝 Bulk Update ({selectedLaborers.length})
            </Button>
          )}
          <Button variant="primary" onClick={loadLaborers}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">{stats.total}</h4>
              <small>Total Laborers</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">{stats.active}</h4>
              <small>Active</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">{stats.inactive}</h4>
              <small>Inactive</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-danger">{stats.suspended}</h4>
              <small>Suspended</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">{stats.verified}</h4>
              <small>Verified</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-secondary">{stats.available}</h4>
              <small>Available</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Specialization Stats */}
      {specializationStats.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h6>📊 Specialization Distribution</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              {specializationStats.slice(0, 6).map((spec, index) => (
                <Col md={4} key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{spec._id || 'Unknown'}</span>
                    <Badge bg="primary">{spec.count}</Badge>
                  </div>
                  <ProgressBar 
                    now={(spec.count / stats.total) * 100} 
                    className="mt-1"
                    variant="primary"
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Search Laborers</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, phone, specialization..."
                  value={filters.search}
                  onChange={handleSearch}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status Filter</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Specialization</Form.Label>
                <Form.Select
                  value={filters.specialization}
                  onChange={(e) => handleSpecializationFilter(e.target.value)}
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec, index) => (
                    <option key={index} value={spec}>{spec}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Verification</Form.Label>
                <Form.Select
                  value={filters.verified}
                  onChange={(e) => handleVerificationFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select
                    value={filters.sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                  >
                    <option value="createdAt">Registration Date</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="specialization">Specialization</option>
                    <option value="rating">Rating</option>
                    <option value="status">Status</option>
                  </Form.Select>
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleSort(filters.sortBy)}
                  >
                    {filters.sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Laborers Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectedLaborers.length === laborers.length && laborers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Laborer</th>
                    <th>Specialization</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Availability</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {laborers.map((laborer) => (
                    <tr key={laborer._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedLaborers.includes(laborer._id)}
                          onChange={() => handleLaborerSelect(laborer._id)}
                        />
                      </td>
                      <td>
                        <div>
                          <strong>{laborer.name}</strong>
                          <br />
                          <small className="text-muted">{laborer.email}</small>
                          <br />
                          <small className="text-muted">{laborer.phone}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="info">{laborer.specialization}</Badge>
                      </td>
                      <td>
                        <div>
                          <div>{getRatingStars(laborer.rating || 0)}</div>
                          <small className="text-muted">{laborer.experience || 0} years exp.</small>
                        </div>
                      </td>
                      <td>{getStatusBadge(laborer.status)}</td>
                      <td>{getVerificationBadge(laborer.isVerified)}</td>
                      <td>{getAvailabilityBadge(laborer.isAvailable)}</td>
                      <td>{formatDate(laborer.createdAt)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleViewLaborer(laborer)}>
                              👁️ View Details
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedLaborer(laborer);
                              setShowStatusModal(true);
                            }}>
                              🔄 Update Status
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedLaborer(laborer);
                              setVerificationData({ isVerified: !laborer.isVerified, reason: '' });
                              setShowVerificationModal(true);
                            }}>
                              {laborer.isVerified ? '❌ Unverify' : '✅ Verify'}
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleDeleteLaborer(laborer._id)}
                              className="text-danger"
                            >
                              🗑️ Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
                      disabled={!pagination.hasPrevPage}
                    />
                    <Pagination.Prev 
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={!pagination.hasPrevPage}
                    />
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <Pagination.Item
                        key={page}
                        active={page === pagination.currentPage}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                      >
                        {page}
                      </Pagination.Item>
                    ))}
                    
                    <Pagination.Next 
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={!pagination.hasNextPage}
                    />
                    <Pagination.Last 
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: pagination.totalPages }))}
                      disabled={!pagination.hasNextPage}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Laborer Details Modal */}
      <Modal show={showLaborerModal} onHide={() => setShowLaborerModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🔧 Laborer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLaborer && (
            <Row>
              <Col md={6}>
                <h6>Basic Information</h6>
                <p><strong>Name:</strong> {selectedLaborer.name}</p>
                <p><strong>Email:</strong> {selectedLaborer.email}</p>
                <p><strong>Phone:</strong> {selectedLaborer.phone}</p>
                <p><strong>Specialization:</strong> {selectedLaborer.specialization}</p>
                <p><strong>Experience:</strong> {selectedLaborer.experience || 0} years</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedLaborer.status)}</p>
                <p><strong>Verification:</strong> {getVerificationBadge(selectedLaborer.isVerified)}</p>
                <p><strong>Availability:</strong> {getAvailabilityBadge(selectedLaborer.isAvailable)}</p>
              </Col>
              <Col md={6}>
                <h6>Account Information</h6>
                <p><strong>Laborer ID:</strong> {selectedLaborer._id}</p>
                <p><strong>Registered:</strong> {formatDate(selectedLaborer.createdAt)}</p>
                <p><strong>Last Login:</strong> {selectedLaborer.lastLogin ? formatDate(selectedLaborer.lastLogin) : 'Never'}</p>
                <p><strong>Rating:</strong> {getRatingStars(selectedLaborer.rating || 0)}</p>
                {selectedLaborer.statusReason && (
                  <p><strong>Status Reason:</strong> {selectedLaborer.statusReason}</p>
                )}
                {selectedLaborer.verificationReason && (
                  <p><strong>Verification Reason:</strong> {selectedLaborer.verificationReason}</p>
                )}
              </Col>
              {selectedLaborer.activity && (
                <Col md={12} className="mt-3">
                  <h6>Activity</h6>
                  <p><strong>Total Jobs Completed:</strong> {selectedLaborer.activity.totalJobsCompleted}</p>
                  <p><strong>Total Reviews:</strong> {selectedLaborer.activity.totalReviews}</p>
                  <p><strong>Average Rating:</strong> {selectedLaborer.activity.averageRating}</p>
                  <p><strong>Total Earnings:</strong> ₹{selectedLaborer.activity.totalEarnings || 0}</p>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLaborerModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowLaborerModal(false);
              setShowStatusModal(true);
            }}
          >
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🔄 Update Laborer Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={statusData.status}
                onChange={(e) => setStatusData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={statusData.reason}
                onChange={(e) => setStatusData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for status change..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateStatus}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Verification Modal */}
      <Modal show={showVerificationModal} onHide={() => setShowVerificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{verificationData.isVerified ? '✅ Verify' : '❌ Unverify'} Laborer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Verification Status</Form.Label>
              <Form.Check
                type="checkbox"
                label="Mark as verified"
                checked={verificationData.isVerified}
                onChange={(e) => setVerificationData(prev => ({ ...prev, isVerified: e.target.checked }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={verificationData.reason}
                onChange={(e) => setVerificationData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for verification change..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerificationModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateVerification}>
            {verificationData.isVerified ? 'Verify' : 'Unverify'} Laborer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📝 Bulk Update Laborers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            You are about to update {selectedLaborers.length} laborers.
          </Alert>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={bulkData.status}
                onChange={(e) => setBulkData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bulkData.reason}
                onChange={(e) => setBulkData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for status change..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBulkUpdate}>
            Update {selectedLaborers.length} Laborers
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LaborerManagement; 