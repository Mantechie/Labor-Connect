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
  ProgressBar,
  Tab,
  Tabs,
  OverlayTrigger,
  Tooltip,
  ListGroup
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaBell, 
  FaExclamationTriangle, 
  FaBan, 
  FaCheckCircle,
  FaUser,
  FaStar,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaTools,
  FaFlag,
  FaUnlock,
  FaInfoCircle
} from 'react-icons/fa';
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
    rating: '',
    experience: '',
    availability: '',
    complaints: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const dummyLaborers = [
  {
    _id: 'LAB001',
    name: 'Ramesh Kumar',
    specialization: 'Electrician',
    rating: 4.5,
    experience: '5 years',
    status: 'available',
    contact: '9876543210',
  },
  {
    _id: 'LAB002',
    name: 'Suresh Meena',
    specialization: 'Plumber',
    rating: 4.0,
    experience: '3 years',
    status: 'busy',
    contact: '8765432109',
  },
  {
    _id: 'LAB003',
    name: 'Amit Sharma',
    specialization: 'Mason',
    rating: 3.8,
    experience: '2 years',
    status: 'available',
    contact: '9988776655',
  },
  {
    _id: 'LAB004',
    name: 'Sunil Verma',
    specialization: 'Painter',
    rating: 4.2,
    experience: '4 years',
    status: 'busy',
    contact: '9123456780',
  }
  ];

  const [selectedLaborers, setSelectedLaborers] = useState(dummyLaborers);
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
  const [specializations, setSpecializations] = useState(['Plumber','ELectrician','Mason','Construction Laborer','Other (Please Specify)']);
  const [customSpecialization, setCustomSpecialization] = useState('');
  // New state for enhanced features
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showComplaintsModal, setShowComplaintsModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showAddLaborerModal, setShowAddLaborerModal] = useState(false);
  
  const [notificationData, setNotificationData] = useState({
    subject: '',
    message: '',
    type: 'new_job_posted',
    targetType: 'all',
    specialization: '',
    specificId: ''
  });

  const [addLaborerData, setAddLaborerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    experience: 0,
    availability: 'online',
    rating: 0,
    documents: [],
    portfolio: [],
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: ''
    }
  });
  
  const [warningData, setWarningData] = useState({
    reason: '',
    details: ''
  });
  
  const [suspendData, setSuspendData] = useState({
    reason: '',
    endDate: ''
  });
  
  const [complaints, setComplaints] = useState([]);
  const [reviews,] = useState([]);
  const [complaintsStats, setComplaintsStats] = useState({});
  const [reviewsStats] = useState({});

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
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  /*const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };*/

  const handleSpecializationFilter = (specialization) => {
    setFilters(prev => ({ ...prev, specialization }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  /*const handleVerificationFilter = (verified) => {
    setFilters(prev => ({ ...prev, verified }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };*/

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

  const handleAddLaborer = async () => {
    try {
      // Validate required fields
      if (!addLaborerData.name || !addLaborerData.email || !addLaborerData.phone || !addLaborerData.specialization) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      setLoading(true);
      const response = await adminAxiosInstance.post('/admin/laborers', addLaborerData);
      
      if (response.data.success) {
        showToast('Laborer added successfully! Verification required.', 'success');
        setShowAddLaborerModal(false);
        
        // Reset form
        setAddLaborerData({
          name: '',
          email: '',
          phone: '',
          address: '',
          specialization: '',
          experience: 0,
          availability: 'online',
          rating: 0,
          documents: [],
          portfolio: [],
          socialLinks: {
            facebook: '',
            instagram: '',
            youtube: ''
          }
        });
        
        // Reload laborers list
        loadLaborers();
      }
    } catch (error) {
      console.error('Add laborer error:', error);
      showToast(error.response?.data?.message || 'Failed to add laborer', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced features functions
  const handleSendNotification = async () => {
    try {
      let requestBody = {
        subject: notificationData.subject,
        message: notificationData.message,
        type: notificationData.type
      };

      if (notificationData.targetType === 'selected') {
        requestBody.laborerIds = selectedLaborers;
      } else if (notificationData.targetType === 'specialization') {
        requestBody.specialization = filters.specialization;
      }

      const response = await adminAxiosInstance.post('/admin/laborers/notify', requestBody);
      
      showToast(`Notification sent to ${response.data.successCount} laborers`, 'success');
      setShowNotificationModal(false);
      setNotificationData({ subject: '', message: '', type: 'general', targetType: 'selected' });
      setSelectedLaborers([]);
    } catch (error) {
      console.error('Error sending notification:', error);
      showToast(error.response?.data?.message || 'Failed to send notification', 'danger');
    }
  };

  const handleSendWarning = async () => {
    try {
      await adminAxiosInstance.post(`/admin/laborers/${selectedLaborer._id}/warning`, warningData);
      
      showToast('Warning sent successfully', 'success');
      setShowWarningModal(false);
      setWarningData({ reason: '', details: '' });
      loadLaborers();
    } catch (error) {
      console.error('Error sending warning:', error);
      showToast(error.response?.data?.message || 'Failed to send warning', 'danger');
    }
  };

  const handleSuspendLaborer = async () => {
    try {
      await adminAxiosInstance.post(`/admin/laborers/${selectedLaborer._id}/suspend`, suspendData);
      
      showToast('Laborer suspended successfully', 'success');
      setShowSuspendModal(false);
      setSuspendData({ reason: '', endDate: '' });
      loadLaborers();
    } catch (error) {
      console.error('Error suspending laborer:', error);
      showToast(error.response?.data?.message || 'Failed to suspend laborer', 'danger');
    }
  };

  /*const handleUnsuspendLaborer = async (laborerId) => {
    try {
      await adminAxiosInstance.post(`/admin/laborers/${laborerId}/unsuspend`);
      
      showToast('Laborer unsuspended successfully', 'success');
      loadLaborers();
    } catch (error) {
      console.error('Error unsuspending laborer:', error);
      showToast(error.response?.data?.message || 'Failed to unsuspend laborer', 'danger');
    }
  };*/

  const loadLaborerComplaints = async (laborerId) => {
    try {
      const response = await adminAxiosInstance.get(`/admin/laborers/${laborerId}/complaints`);
      setComplaints(response.data.complaints);
      setComplaintsStats(response.data.stats);
      setShowComplaintsModal(true);
    } catch (error) {
      console.error('Error loading complaints:', error);
      showToast('Failed to load complaints', 'danger');
    }
  };

  /*const loadLaborerReviews = async (laborerId) => {
    try {
      const response = await adminAxiosInstance.get(`/admin/laborers/${laborerId}/reviews`);
      setReviews(response.data.reviews);
      setReviewsStats(response.data.stats);
      setShowReviewsModal(true);
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast('Failed to load reviews', 'danger');
    }
  };*/

  const handleExportData = async (format = 'csv') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        specialization: filters.specialization,
        status: filters.status,
        verified: filters.verified
      });

      const response = await adminAxiosInstance.get(`/admin/laborers/export?${queryParams}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `laborers_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      showToast('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Failed to export data', 'danger');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'inactive': 'warning',
      'suspended': 'danger',
      'blocked': 'dark'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getAvailabilityBadge = (availability) => {
    const variants = {
      'online': 'success',
      'busy': 'warning',
      'offline': 'secondary'
    };
    const icons = {
      'online': '🟢',
      'busy': '🟡',
      'offline': '⚫'
    };
    return (
      <Badge bg={variants[availability] || 'secondary'}>
        {icons[availability]} {availability}
      </Badge>
    );
  };

  /*const getComplaintsBadge = (complaints) => {
    if (!complaints || complaints.length === 0) {
      return <Badge bg="success">✅ Clean</Badge>;
    }
    
    const criticalCount = complaints.filter(c => c.severity === 'critical').length;
    const highCount = complaints.filter(c => c.severity === 'high').length;
    
    if (criticalCount > 0) {
      return <Badge bg="danger">🚨 {complaints.length} ({criticalCount} critical)</Badge>;
    } else if (highCount > 0) {
      return <Badge bg="warning">⚠️ {complaints.length} ({highCount} high)</Badge>;
    } else {
      return <Badge bg="info">📝 {complaints.length}</Badge>;
    }
  };*/

  const getVerificationBadge = (isVerified) => {
    return isVerified ? 
      <Badge bg="success">Verified</Badge> : 
      <Badge bg="warning">Unverified</Badge>;
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
        <Button variant="outline-primary" onClick={loadLaborers} size="sm">
          🔄 Refresh
        </Button>
      </div>

      {/* Action Buttons - Before Stats */}
      <div className="d-flex gap-2 mb-4">
        <Button variant="outline-success" onClick={() => handleExportData('csv')}>
          📊 Export CSV
        </Button>
        <Button variant="outline-primary" onClick={() => setShowNotificationModal(true)}>
          🔔 Send Notification
        </Button>
        <Button variant="outline-primary" onClick={() => setShowAddLaborerModal(true)}>
          ➕ Add Laborer
        </Button>
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
      )};
      {/* Filters and Search Bar */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            {/* 🔍 Search */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search Laborer</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                  <FaSearch />
                  </InputGroup.Text>
                 <Form.Control
                  type="text"
                  placeholder="Search by Name or Laborer ID..."
                  value={filters.search}
                  onChange={handleSearch}
                  />
                 </InputGroup>
              </Form.Group>
            </Col>

            {/* 🛠️ Specialization */}
            <Col md={2}>
              <Form.Group>
                <Form.Label>Specialization</Form.Label>
                <Form.Select
                  value={filters.specialization}
                  onChange={(e) => handleSpecializationFilter(e.target.value)}
                >
                <option value="">All</option>
                {specializations.map((spec, i) => (
                <option key={i} value={spec}>
                  {spec.charAt(0).toUpperCase() + spec.slice(1)}
                </option>
                ))}
                </Form.Select>
                {specializations === 'Other' && (
                  <Form.Control
                    type="text"
                    placeholder="Enter custom specialization"
                    className="mt-2"
                    value={customSpecialization}
                    onChange={(e) => setCustomSpecialization(e.target.value)}
                  />
                )}
              </Form.Group>
            </Col>

            {/* 🧠 Experience */}
            <Col md={2}>
              <Form.Group>
               <Form.Label>Experience</Form.Label>
                <Form.Select
                  value={filters.experience}
                  onChange={(e) =>
                  setFilters((prev) => ({ ...prev, experience: e.target.value }))
                }
                >
                <option value="">All</option>
                <option value="0-2">0-2 years</option>
                <option value="2-5">2-5 years</option>
                <option value="5+">5+ years</option>
                 </Form.Select>
              </Form.Group>
            </Col>

            {/* ⭐ Rating */}
            <Col md={2}>
            <Form.Group>
              <Form.Label>Rating</Form.Label>
              <Form.Select
                value={filters.rating}
                onChange={(e) =>
                setFilters((prev) => ({ ...prev, rating: e.target.value }))
              }
              >
              <option value="">All</option>
              <option value="4.5">≥ 4.5⭐</option>
              <option value="4.0">≥ 4.0⭐</option>
              <option value="3.5">≥ 3.5⭐</option>
              <option value="3.0">≥ 3.0⭐</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* 🟢 Availability */}
          <Col md={2}>
            <Form.Group>
            <Form.Label>Availability</Form.Label>
            <Form.Select
              value={filters.availability}
              onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                availability: e.target.value,
              }))
            }
            >
              <option value="">All</option>
              <option value="online">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* 🚫 Complaints */}
        <Col md={2}>
          <Form.Group>
            <Form.Label>Complaints</Form.Label>
            <Form.Select
              value={filters.complaints}
              onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                complaints: e.target.value,
              }))
            }
            >
              <option value="">All</option>
              <option value="0">No complaints</option>
              <option value="1-3">1-3 complaints</option>
              <option value="3+">3+ complaints</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* ✔️ Verification */}
        <Col md={2}>
          <Form.Group>
            <Form.Label>Verification</Form.Label>
            <Form.Select
              value={filters.verified}
              onChange={(e) =>
              setFilters((prev) => ({ ...prev, verified: e.target.value }))
            }
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* 🔃 Sort + Order */}
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
                  <option value="specialization">Specialization</option>
                  <option value="rating">Rating</option>
                  <option value="experience">Experience</option>
                </Form.Select>
              </div>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Order</Form.Label>
              <Button
                variant="outline-secondary"
                onClick={() => handleSort(filters.sortBy)}
                className="w-100"
              >
                {filters.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </Button>
          </Form.Group>
        <hr></hr>
        </Col>
        {/* ✅ Apply / 🔄 Reset */}
        <Col md={3} className="d-flex align-items-end">
            <Button
              variant="outline-warning"
              className="w-100"
              onClick={() => {
                setFilters({
                  search: '',
                  status: '',
                  specialization: '',
                  verified: '',
                  rating: '',
                  experience: '',
                  availability: '',
                  complaints: '',
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                });
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            >
              🔁 Clear
            </Button>
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
                    <th>Laborer Name / ID</th>
                    <th>Activity</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Rating</th>
                    <th>Availability</th>
                    <th>Complaints</th>
                    <th>Verification</th>
                    <th>Earning</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyLaborers.map((laborer) => (
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
                          <strong>{laborer.user?.name || 'N/A'}</strong>
                          <br />
                          <small className="text-muted">ID: {laborer._id.slice(-6)}</small>
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {laborer.lastActive ? (
                            <>Last seen: {new Date(laborer.lastActive).toLocaleDateString()}</>
                          ) : (
                            'Never logged in'
                          )}
                        </small>
                      </td>
                      <td>
                        <Badge bg="info">
                          <FaTools className="me-1" />
                          {laborer.specialization?.charAt(0).toUpperCase() + laborer.specialization?.slice(1)}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <strong>{laborer.experience || 0} yrs</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaStar className="text-warning me-1" />
                          <span>{laborer.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td>
                        {laborer.availability === 'online' ? (
                          <Badge bg="success">Available</Badge>
                        ) : laborer.availability === 'busy' ? (
                          <Badge bg="warning">Busy</Badge>
                        ) : laborer.availability === 'offline' ? (
                          <Badge bg="secondary">Offline</Badge>
                        ) : (
                          <Badge bg="danger">Blocked</Badge>
                        )}
                      </td>
                      <td className="text-center">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip>
                              {laborer.complaintsReceived?.length > 0 
                                ? `${laborer.complaintsReceived.length} complaints - Click to view details`
                                : 'No complaints'
                              }
                            </Tooltip>
                          }
                        >
                          <span 
                            className={laborer.complaintsReceived?.length > 3 ? 'text-danger fw-bold' : 'text-muted'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => loadLaborerComplaints(laborer._id)}
                          >
                            {laborer.complaintsReceived?.length || 0}
                            {laborer.complaintsReceived?.length > 3 && ' 🚩'}
                          </span>
                        </OverlayTrigger>
                      </td>
                      <td className="text-center">
                        {laborer.isVerified ? (
                          <Badge bg="success">
                            <FaCheckCircle className="me-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge bg="warning">
                            ⏳ Pending
                          </Badge>
                        )}
                      </td>
                      <td className="text-center">
                        <strong className="text-success">
                          ₹{(laborer.totalEarnings || 0).toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleViewLaborer(laborer)}>
                              ✅ View Details
                            </Dropdown.Item>
                            
                            <Dropdown.Item onClick={() => {
                              // TODO: Implement applied jobs view
                              console.log('View applied jobs for', laborer._id);
                            }}>
                              💼 View Applied Jobs
                            </Dropdown.Item>
                            
                            <Dropdown.Item onClick={() => {
                              // TODO: Implement portfolio view
                              console.log('View work portfolio for', laborer._id);
                            }}>
                              👷 View Work
                            </Dropdown.Item>
                            
                            <Dropdown.Item onClick={() => {
                              // TODO: Implement documents view
                              console.log('View documents for', laborer._id);
                            }}>
                              📄 View Documents
                            </Dropdown.Item>
                            
                            <Dropdown.Item onClick={() => {
                              // TODO: Implement message history
                              console.log('View message history for', laborer._id);
                            }}>
                              🗨️ Message History
                            </Dropdown.Item>
                            
                            <Dropdown.Divider />
                            
                            <Dropdown.Item 
                              onClick={() => {
                                setSelectedLaborer(laborer);
                                setShowSuspendModal(true);
                              }}
                              className="text-warning"
                            >
                              🚫 Block Laborer
                            </Dropdown.Item>
                            
                            <Dropdown.Item 
                              onClick={() => handleDeleteLaborer(laborer._id)}
                              className="text-danger"
                            >
                              🗑️ Delete Laborer
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
                <p><strong>Availability:</strong> {getAvailabilityBadge(selectedLaborer.availability || 'offline')}</p>
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

      {/* Notification Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBell className="me-2" />
            Send Notification to Laborers
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Send to</Form.Label>
              <Form.Select
                value={notificationData.targetType}
                onChange={(e) => setNotificationData(prev => ({ ...prev, targetType: e.target.value }))}
              >
                <option value="all">All Laborers</option>
                <option value="specialization">Specific Specialization</option>
                <option value="specific">Specific Laborer (by Name/ID)</option>
              </Form.Select>
            </Form.Group>
            
            {notificationData.targetType === 'specialization' && (
              <Form.Group className="mb-3">
                <Form.Label>Select Specialization</Form.Label>
                <Form.Select
                  value={notificationData.specialization}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, specialization: e.target.value }))}
                >
                  <option value="">Choose specialization...</option>
                  {specializations.map((spec, index) => (
                    <option key={index} value={spec}>{spec.charAt(0).toUpperCase() + spec.slice(1)}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            
            {notificationData.targetType === 'specific' && (
              <Form.Group className="mb-3">
                <Form.Label>Laborer Name or ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter laborer name or ID..."
                  value={notificationData.specificId}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, specificId: e.target.value }))}
                />
                <Form.Text className="text-muted">
                  You can enter either the laborer's name or their ID
                </Form.Text>
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Subject *</Form.Label>
              <Form.Control
                type="text"
                value={notificationData.subject}
                onChange={(e) => setNotificationData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter notification subject..."
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Message *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={notificationData.message}
                onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your message..."
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Notification Type</Form.Label>
              <Form.Select
                value={notificationData.type}
                onChange={(e) => setNotificationData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="new_job_posted">New Job Posted</option>
                <option value="document_expiry_alert">Document Expiry Alert</option>
                <option value="general_updates">General Updates</option>
                <option value="system_maintenance">System Maintenance</option>
                <option value="policy_update">Policy Update</option>
                <option value="payment_reminder">Payment Reminder</option>
                <option value="profile_incomplete">Profile Incomplete</option>
                <option value="verification_required">Verification Required</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendNotification}
            disabled={!notificationData.subject || !notificationData.message}
          >
            <FaBell className="me-1" />
            Send Notification
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Warning Modal */}
      <Modal show={showWarningModal} onHide={() => setShowWarningModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="me-2 text-warning" />
            Send Warning to {selectedLaborer?.user?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FaExclamationTriangle className="me-2" />
            This will send a formal warning to the laborer via email and SMS.
          </Alert>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Warning Reason *</Form.Label>
              <Form.Select
                value={warningData.reason}
                onChange={(e) => setWarningData(prev => ({ ...prev, reason: e.target.value }))}
                required
              >
                <option value="">Select reason...</option>
                <option value="Poor Service Quality">Poor Service Quality</option>
                <option value="Unprofessional Behavior">Unprofessional Behavior</option>
                <option value="Terms of Service Violation">Terms of Service Violation</option>
                <option value="Customer Complaints">Customer Complaints</option>
                <option value="Fake Profile Information">Fake Profile Information</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Details *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={warningData.details}
                onChange={(e) => setWarningData(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Provide detailed explanation of the warning..."
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWarningModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="warning" 
            onClick={handleSendWarning}
            disabled={!warningData.reason || !warningData.details}
          >
            <FaExclamationTriangle className="me-1" />
            Send Warning
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Suspend Modal */}
      <Modal show={showSuspendModal} onHide={() => setShowSuspendModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBan className="me-2 text-danger" />
            Suspend {selectedLaborer?.user?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <FaBan className="me-2" />
            This will suspend the laborer's account and prevent them from receiving jobs.
          </Alert>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Suspension Reason *</Form.Label>
              <Form.Select
                value={suspendData.reason}
                onChange={(e) => setSuspendData(prev => ({ ...prev, reason: e.target.value }))}
                required
              >
                <option value="">Select reason...</option>
                <option value="Multiple Customer Complaints">Multiple Customer Complaints</option>
                <option value="Fraudulent Activity">Fraudulent Activity</option>
                <option value="Violation of Terms">Violation of Terms</option>
                <option value="Safety Concerns">Safety Concerns</option>
                <option value="Repeated Warnings Ignored">Repeated Warnings Ignored</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Suspension End Date (Optional)</Form.Label>
              <Form.Control
                type="date"
                value={suspendData.endDate}
                onChange={(e) => setSuspendData(prev => ({ ...prev, endDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
              <Form.Text className="text-muted">
                Leave empty for indefinite suspension
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuspendModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleSuspendLaborer}
            disabled={!suspendData.reason}
          >
            <FaBan className="me-1" />
            Suspend Account
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Complaints Modal */}
      <Modal show={showComplaintsModal} onHide={() => setShowComplaintsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFlag className="me-2" />
            Complaints for {selectedLaborer?.user?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {complaintsStats && (
            <Row className="mb-3">
              <Col md={3}>
                <Card className="text-center border-info">
                  <Card.Body>
                    <h5 className="text-info">{complaintsStats.total || 0}</h5>
                    <small>Total</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-warning">
                  <Card.Body>
                    <h5 className="text-warning">{complaintsStats.pending || 0}</h5>
                    <small>Pending</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-danger">
                  <Card.Body>
                    <h5 className="text-danger">{complaintsStats.critical || 0}</h5>
                    <small>Critical</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-success">
                  <Card.Body>
                    <h5 className="text-success">{complaintsStats.resolved || 0}</h5>
                    <small>Resolved</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {complaints.length > 0 ? (
              <ListGroup>
                {complaints.map((complaint, index) => (
                  <ListGroup.Item key={index} className="mb-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{complaint.reason}</h6>
                        <p className="mb-1">{complaint.details}</p>
                        <small className="text-muted">
                          From: {complaint.from?.name || 'Anonymous'} • 
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="text-end">
                        <Badge bg={
                          complaint.severity === 'critical' ? 'danger' :
                          complaint.severity === 'high' ? 'warning' :
                          complaint.severity === 'medium' ? 'info' : 'secondary'
                        }>
                          {complaint.severity}
                        </Badge>
                        <br />
                        <Badge bg={
                          complaint.status === 'resolved' ? 'success' :
                          complaint.status === 'investigating' ? 'warning' :
                          complaint.status === 'dismissed' ? 'secondary' : 'danger'
                        } className="mt-1">
                          {complaint.status}
                        </Badge>
                      </div>
                    </div>
                    {complaint.adminNotes && (
                      <div className="mt-2 p-2 bg-light rounded">
                        <small><strong>Admin Notes:</strong> {complaint.adminNotes}</small>
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center py-4">
                <FaCheckCircle className="text-success mb-2" size={48} />
                <p className="text-muted">No complaints found for this laborer.</p>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowComplaintsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reviews Modal */}
      <Modal show={showReviewsModal} onHide={() => setShowReviewsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaStar className="me-2" />
            Reviews for {selectedLaborer?.user?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewsStats && (
            <Row className="mb-3">
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h4 className="text-warning">
                      <FaStar className="me-1" />
                      {reviewsStats.averageRating?.toFixed(1) || '0.0'}
                    </h4>
                    <small>Average Rating</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h4 className="text-info">{reviewsStats.totalReviews || 0}</h4>
                    <small>Total Reviews</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <div>
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="d-flex align-items-center mb-1">
                          <span className="me-2">{rating}⭐</span>
                          <ProgressBar 
                            now={(reviewsStats.ratingDistribution?.[rating] || 0) / (reviewsStats.totalReviews || 1) * 100}
                            className="flex-grow-1 me-2"
                            style={{ height: '8px' }}
                          />
                          <small>{reviewsStats.ratingDistribution?.[rating] || 0}</small>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {reviews.length > 0 ? (
              <ListGroup>
                {reviews.map((review, index) => (
                  <ListGroup.Item key={index} className="mb-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <div className="me-2">
                            {'⭐'.repeat(review.rating)}
                          </div>
                          <small className="text-muted">
                            by {review.reviewer?.name || 'Anonymous'} • 
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        {review.comment && <p className="mb-0">{review.comment}</p>}
                      </div>
                      <Badge bg={review.isVerified ? 'success' : 'warning'}>
                        {review.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center py-4">
                <FaStar className="text-muted mb-2" size={48} />
                <p className="text-muted">No reviews found for this laborer.</p>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Laborer Modal */}
      <Modal show={showAddLaborerModal} onHide={() => setShowAddLaborerModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>➕ Add New Laborer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    value={addLaborerData.name}
                    onChange={(e) => setAddLaborerData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    value={addLaborerData.email}
                    onChange={(e) => setAddLaborerData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={addLaborerData.phone}
                    onChange={(e) => setAddLaborerData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Specialization *</Form.Label>
                  <Form.Select
                    value={addLaborerData.specialization}
                    onChange={(e) => setAddLaborerData(prev => ({ ...prev, specialization: e.target.value }))}
                    required
                  >
                    <option value="">Select specialization</option>
                    <option value="plumber">Plumber</option>
                    <option value="electrician">Electrician</option>
                    <option value="mason">Mason</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="painter">Painter</option>
                    <option value="welder">Welder</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter complete address"
                value={addLaborerData.address}
                onChange={(e) => setAddLaborerData(prev => ({ ...prev, address: e.target.value }))}
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Experience (Years)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="50"
                    value={addLaborerData.experience}
                    onChange={(e) => setAddLaborerData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Availability</Form.Label>
                  <Form.Select
                    value={addLaborerData.availability}
                    onChange={(e) => setAddLaborerData(prev => ({ ...prev, availability: e.target.value }))}
                  >
                    <option value="online">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Initial Rating (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={addLaborerData.rating}
                    onChange={(e) => setAddLaborerData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Upload Documents (Aadhar, ID Proof, etc.)</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  // TODO: Handle file upload
                  console.log('Files selected:', e.target.files);
                }}
              />
              <Form.Text className="text-muted">
                Upload Aadhar card, ID proof, certificates, etc. (JPG, PNG, PDF)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Portfolio Images/Videos</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.mp4,.mov"
                onChange={(e) => {
                  // TODO: Handle portfolio upload
                  console.log('Portfolio files selected:', e.target.files);
                }}
              />
              <Form.Text className="text-muted">
                Upload work samples, portfolio images/videos (JPG, PNG, MP4, MOV)
              </Form.Text>
            </Form.Group>

            <h6>Social Media Links (Optional)</h6>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Facebook</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="Facebook profile URL"
                    value={addLaborerData.socialLinks.facebook}
                    onChange={(e) => setAddLaborerData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Instagram</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="Instagram profile URL"
                    value={addLaborerData.socialLinks.instagram}
                    onChange={(e) => setAddLaborerData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>YouTube</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="YouTube channel URL"
                    value={addLaborerData.socialLinks.youtube}
                    onChange={(e) => setAddLaborerData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info">
              <FaInfoCircle className="me-2" />
              New laborers will require admin verification before being listed publicly.
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddLaborerModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddLaborer}>
            Add Laborer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LaborerManagement; 