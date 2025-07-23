import React, { useState, useEffect } from 'react';
import { useToast } from './ToastContext';
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
  Tabs,
  Tab,
  ListGroup,
  ProgressBar
} from 'react-bootstrap';

const UserManagement = () => {
  const { showToast } = useToast();
  
  // Mock data for customer users only
  const mockUsers = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 43210',
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: '2024-01-20T14:25:00Z',
      jobsPosted: 5,
      totalSpent: 15000,
      complaints: {
        received: 1,
        filed: 2
      },
      loginHistory: [
        { date: '2024-01-20T14:25:00Z', ip: '192.168.1.100', device: 'Chrome on Windows' },
        { date: '2024-01-19T09:15:00Z', ip: '192.168.1.100', device: 'Mobile App' },
        { date: '2024-01-18T16:30:00Z', ip: '192.168.1.101', device: 'Firefox on Mac' }
      ],
      suspiciousActivity: false,
      blockReason: '',
      adminNotes: ''
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+91 87654 32109',
      status: 'active',
      createdAt: '2024-01-10T09:15:00Z',
      lastLogin: '2024-01-19T16:45:00Z',
      jobsPosted: 3,
      totalSpent: 8500,
      complaints: {
        received: 0,
        filed: 1
      },
      loginHistory: [
        { date: '2024-01-19T16:45:00Z', ip: '192.168.1.102', device: 'Mobile App' },
        { date: '2024-01-18T10:20:00Z', ip: '192.168.1.102', device: 'Chrome on Android' }
      ],
      suspiciousActivity: false,
      blockReason: '',
      adminNotes: ''
    },
    {
      _id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+91 76543 21098',
      status: 'blocked',
      createdAt: '2024-01-05T11:20:00Z',
      lastLogin: '2024-01-18T12:30:00Z',
      jobsPosted: 8,
      totalSpent: 22000,
      complaints: {
        received: 4,
        filed: 1
      },
      loginHistory: [
        { date: '2024-01-18T12:30:00Z', ip: '192.168.1.103', device: 'Chrome on Windows' },
        { date: '2024-01-17T14:15:00Z', ip: '192.168.1.103', device: 'Mobile App' },
        { date: '2024-01-16T02:30:00Z', ip: '203.0.113.1', device: 'Unknown Browser' }
      ],
      suspiciousActivity: true,
      blockReason: 'Multiple spam job postings and complaints from laborers',
      adminNotes: 'User flagged for suspicious activity - monitor closely'
    },
    {
      _id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+91 99887 76655',
      status: 'inactive',
      createdAt: '2024-01-01T08:00:00Z',
      lastLogin: '2024-01-10T11:15:00Z',
      jobsPosted: 1,
      totalSpent: 2500,
      complaints: {
        received: 0,
        filed: 0
      },
      loginHistory: [
        { date: '2024-01-10T11:15:00Z', ip: '192.168.1.104', device: 'Safari on iPhone' }
      ],
      suspiciousActivity: false,
      blockReason: '',
      adminNotes: 'Inactive user - last login over 10 days ago'
    }
  ];

  // Mock complaints data
  const mockComplaints = [
    {
      _id: 'comp_001',
      complaintId: 'COMP-2024-001',
      userId: '1',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      subject: 'Laborer did not show up for scheduled work',
      description: 'I hired a plumber through the platform for emergency pipe repair. The laborer confirmed the appointment but never showed up. I waited for 3 hours and had to find alternative help. This caused significant inconvenience and additional costs.',
      category: 'Service Quality',
      severity: 'high',
      status: 'open',
      dateSubmitted: '2024-01-20T09:30:00Z',
      assignedTo: 'Admin Team',
      laborerName: 'Ravi Kumar',
      laborerId: 'lab_001',
      jobId: 'job_001',
      jobTitle: 'Emergency Pipe Repair',
      adminNotes: 'Customer seems genuine. Need to investigate laborer\'s side.',
      resolution: '',
      resolvedAt: null,
      escalated: false
    },
    {
      _id: 'comp_002',
      complaintId: 'COMP-2024-002',
      userId: '2',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@example.com',
      subject: 'Poor quality work and overcharging',
      description: 'The electrician I hired did substandard wiring work and charged me 50% more than the agreed amount. When I questioned the extra charges, he became rude and unprofessional. The work quality is also questionable.',
      category: 'Billing Dispute',
      severity: 'medium',
      status: 'in_progress',
      dateSubmitted: '2024-01-18T14:15:00Z',
      assignedTo: 'Support Team',
      laborerName: 'Suresh Sharma',
      laborerId: 'lab_002',
      jobId: 'job_002',
      jobTitle: 'House Wiring Installation',
      adminNotes: 'Both parties contacted. Investigating billing discrepancy.',
      resolution: 'Partial refund processed. Laborer warned about pricing transparency.',
      resolvedAt: null,
      escalated: true
    },
    {
      _id: 'comp_003',
      complaintId: 'COMP-2024-003',
      userId: '3',
      userName: 'Mike Johnson',
      userEmail: 'mike.johnson@example.com',
      subject: 'Platform technical issues during payment',
      description: 'I was trying to make payment for completed cleaning service but the payment gateway kept failing. I tried multiple times and my bank account was debited twice but the payment status shows failed. Very frustrating experience.',
      category: 'Technical Issue',
      severity: 'high',
      status: 'resolved',
      dateSubmitted: '2024-01-15T11:20:00Z',
      assignedTo: 'Tech Team',
      laborerName: 'Geeta Devi',
      laborerId: 'lab_003',
      jobId: 'job_003',
      jobTitle: 'Deep House Cleaning',
      adminNotes: 'Payment gateway issue confirmed. Duplicate charges reversed.',
      resolution: 'Duplicate charges reversed within 24 hours. Payment gateway issue fixed.',
      resolvedAt: '2024-01-16T10:30:00Z',
      escalated: false
    },
    {
      _id: 'comp_004',
      complaintId: 'COMP-2024-004',
      userId: '4',
      userName: 'Sarah Wilson',
      userEmail: 'sarah.wilson@example.com',
      subject: 'Inappropriate behavior by laborer',
      description: 'The gardener I hired made inappropriate comments and made me feel uncomfortable. This is completely unacceptable behavior and I want strict action taken against this person.',
      category: 'Behavioral Issue',
      severity: 'critical',
      status: 'escalated',
      dateSubmitted: '2024-01-12T16:45:00Z',
      assignedTo: 'Senior Management',
      laborerName: 'Ramesh Gupta',
      laborerId: 'lab_004',
      jobId: 'job_004',
      jobTitle: 'Garden Maintenance',
      adminNotes: 'Serious allegation. Laborer suspended pending investigation.',
      resolution: '',
      resolvedAt: null,
      escalated: true
    },
    {
      _id: 'comp_005',
      complaintId: 'COMP-2024-005',
      userId: '1',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      subject: 'Difficulty in finding reliable laborers',
      description: 'I have posted multiple jobs but most laborers who apply are either not qualified or not reliable. The platform needs better vetting process for laborers.',
      category: 'Platform Feedback',
      severity: 'low',
      status: 'open',
      dateSubmitted: '2024-01-10T08:00:00Z',
      assignedTo: 'Product Team',
      laborerName: 'Multiple',
      laborerId: 'multiple',
      jobId: 'multiple',
      jobTitle: 'Various Jobs',
      adminNotes: 'Valid feedback. Consider improving laborer verification process.',
      resolution: '',
      resolvedAt: null,
      escalated: false
    },
    {
      _id: 'comp_006',
      complaintId: 'COMP-2024-006',
      userId: '2',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@example.com',
      subject: 'App crashes during job posting',
      description: 'The mobile app keeps crashing when I try to post a new job. I have tried restarting the app and my phone but the issue persists. Using Android version 12.',
      category: 'Technical Issue',
      severity: 'medium',
      status: 'resolved',
      dateSubmitted: '2024-01-08T13:30:00Z',
      assignedTo: 'Mobile Team',
      laborerName: 'N/A',
      laborerId: 'N/A',
      jobId: 'N/A',
      jobTitle: 'N/A',
      adminNotes: 'App bug confirmed. Fixed in version 2.1.3',
      resolution: 'Bug fixed in latest app update. User notified to update app.',
      resolvedAt: '2024-01-09T15:20:00Z',
      escalated: false
    }
  ];

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0,
    totalJobsPosted: 0,
    totalSpent: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    minJobs: '',
    maxJobs: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showJobsModal, setShowJobsModal] = useState(false);
  const [showMessageHistoryModal, setShowMessageHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showComplaintsModal, setShowComplaintsModal] = useState(false);
  const [showComplaintDetailsModal, setShowComplaintDetailsModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [blockData, setBlockData] = useState({
    reason: '',
    adminNotes: ''
  });
  const [notificationData, setNotificationData] = useState({
    subject: '',
    message: '',
    type: 'all'
  });

  // Complaints state
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsFilters, setComplaintsFilters] = useState({
    search: '',
    status: '',
    severity: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'dateSubmitted',
    sortOrder: 'desc'
  });
  const [complaintsPagination, setComplaintsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalComplaints: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    if (showComplaintsModal) {
      loadComplaints();
    }
    // eslint-disable-next-line
  }, [complaintsFilters, complaintsPagination.currentPage]);

  const loadUsers = async (showRefreshToast = false) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter users based on search and filters
      let filteredUsers = mockUsers.filter(user => {
        const matchesSearch = !filters.search || 
          user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.phone.includes(filters.search);
        
        const matchesStatus = !filters.status || user.status === filters.status;
        
        const matchesDateFrom = !filters.dateFrom || 
          new Date(user.createdAt) >= new Date(filters.dateFrom);
        
        const matchesDateTo = !filters.dateTo || 
          new Date(user.createdAt) <= new Date(filters.dateTo);
        
        const matchesMinJobs = !filters.minJobs || 
          user.jobsPosted >= parseInt(filters.minJobs);
        
        const matchesMaxJobs = !filters.maxJobs || 
          user.jobsPosted <= parseInt(filters.maxJobs);
        
        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo && matchesMinJobs && matchesMaxJobs;
      });

      // Sort users
      filteredUsers.sort((a, b) => {
        let aValue = a[filters.sortBy];
        let bValue = b[filters.sortBy];
        
        if (filters.sortBy === 'createdAt' || filters.sortBy === 'lastLogin') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Pagination
      const itemsPerPage = 10;
      const startIndex = (pagination.currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setPagination({
        currentPage: pagination.currentPage,
        totalPages: Math.ceil(filteredUsers.length / itemsPerPage),
        totalUsers: filteredUsers.length,
        hasNextPage: endIndex < filteredUsers.length,
        hasPrevPage: pagination.currentPage > 1
      });

      // Calculate stats
      setStats({
        total: mockUsers.length,
        active: mockUsers.filter(u => u.status === 'active').length,
        inactive: mockUsers.filter(u => u.status === 'inactive').length,
        blocked: mockUsers.filter(u => u.status === 'blocked').length,
        totalJobsPosted: mockUsers.reduce((sum, u) => sum + u.jobsPosted, 0),
        totalSpent: mockUsers.reduce((sum, u) => sum + u.totalSpent, 0)
      });

      if (showRefreshToast) {
        showToast('Users refreshed successfully!', 'success');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Failed to load users', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilter = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSort = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };


  /*const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };*/

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleBlockUser = async () => {
    try {
      const newStatus = selectedUser.status === 'blocked' ? 'active' : 'blocked';
      
      console.log('Updating user status:', { 
        userId: selectedUser._id, 
        status: newStatus,
        reason: blockData.reason,
        adminNotes: blockData.adminNotes
      });
      
      setShowBlockModal(false);
      setBlockData({ reason: '', adminNotes: '' });
      loadUsers();
      showToast(`User ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully!`, 'success');
    } catch (error) {
      console.error('Error updating user status:', error);
      showToast('Failed to update user status', 'danger');
    }
  };

  const handleSendNotification = async () => {
    try {
      console.log('Sending notification:', notificationData);
      
      setShowNotificationModal(false);
      setNotificationData({ subject: '', message: '', type: 'all' });
      showToast('Notification sent successfully!', 'success');
    } catch (error) {
      console.error('Error sending notification:', error);
      showToast('Failed to send notification', 'danger');
    }
  };

  const handleDeleteUser = async () => {
    try {
      console.log('Deleting user:', selectedUser._id);
      setShowDeleteModal(false);
      loadUsers();
      showToast('User deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user', 'danger');
    }
  };

  const handleExportUsers = () => {
    // Create CSV content
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Status', 'Jobs Posted', 'Total Spent', 'Join Date', 'Last Login', 'Complaints Received', 'Complaints Filed'],
      ...users.map(user => [
        user.name,
        user.email,
        user.phone,
        user.status,
        user.jobsPosted,
        `₹${user.totalSpent}`,
        formatDate(user.createdAt),
        user.lastLogin ? formatDate(user.lastLogin) : 'Never',
        user.complaints.received,
        user.complaints.filed
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Users exported successfully!', 'success');
  };

  // Complaints Management Functions
  const loadComplaints = async (showLoading = false) => {
    if (showLoading) setComplaintsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter complaints based on search and filters
      let filteredComplaints = mockComplaints.filter(complaint => {
        const matchesSearch = !complaintsFilters.search || 
          complaint.subject.toLowerCase().includes(complaintsFilters.search.toLowerCase()) ||
          complaint.userName.toLowerCase().includes(complaintsFilters.search.toLowerCase()) ||
          complaint.complaintId.toLowerCase().includes(complaintsFilters.search.toLowerCase()) ||
          complaint.description.toLowerCase().includes(complaintsFilters.search.toLowerCase());
        
        const matchesStatus = !complaintsFilters.status || complaint.status === complaintsFilters.status;
        const matchesSeverity = !complaintsFilters.severity || complaint.severity === complaintsFilters.severity;
        
        const matchesDateFrom = !complaintsFilters.dateFrom || 
          new Date(complaint.dateSubmitted) >= new Date(complaintsFilters.dateFrom);
        
        const matchesDateTo = !complaintsFilters.dateTo || 
          new Date(complaint.dateSubmitted) <= new Date(complaintsFilters.dateTo);
        
        return matchesSearch && matchesStatus && matchesSeverity && matchesDateFrom && matchesDateTo;
      });

      // Sort complaints
      filteredComplaints.sort((a, b) => {
        let aValue = a[complaintsFilters.sortBy];
        let bValue = b[complaintsFilters.sortBy];
        
        if (complaintsFilters.sortBy === 'dateSubmitted' || complaintsFilters.sortBy === 'resolvedAt') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }
        
        if (complaintsFilters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Pagination
      const itemsPerPage = 10;
      const startIndex = (complaintsPagination.currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex);

      setComplaints(paginatedComplaints);
      setComplaintsPagination({
        currentPage: complaintsPagination.currentPage,
        totalPages: Math.ceil(filteredComplaints.length / itemsPerPage),
        totalComplaints: filteredComplaints.length,
        hasNextPage: endIndex < filteredComplaints.length,
        hasPrevPage: complaintsPagination.currentPage > 1
      });

    } catch (error) {
      console.error('Error loading complaints:', error);
      showToast('Failed to load complaints', 'danger');
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleComplaintsFilter = (key, value) => {
    setComplaintsFilters(prev => ({ ...prev, [key]: value }));
    setComplaintsPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleComplaintsSort = (sortBy) => {
    const newOrder = complaintsFilters.sortBy === sortBy && complaintsFilters.sortOrder === 'desc' ? 'asc' : 'desc';
    setComplaintsFilters(prev => ({ ...prev, sortBy, sortOrder: newOrder }));
  };

  const handleComplaintsPageChange = (page) => {
    setComplaintsPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintDetailsModal(true);
  };

  const handleUpdateComplaintStatus = async (complaintId, newStatus) => {
    try {
      console.log('Updating complaint status:', { complaintId, newStatus });
      showToast(`Complaint marked as ${newStatus}!`, 'success');
      loadComplaints();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      showToast('Failed to update complaint status', 'danger');
    }
  };

  const handleExportComplaints = () => {
    // Create CSV content for complaints
    const csvContent = [
      ['Complaint ID', 'User Name', 'User Email', 'Subject', 'Category', 'Severity', 'Status', 'Date Submitted', 'Assigned To', 'Laborer', 'Job Title', 'Resolved At'],
      ...complaints.map(complaint => [
        complaint.complaintId,
        complaint.userName,
        complaint.userEmail,
        complaint.subject,
        complaint.category,
        complaint.severity,
        complaint.status,
        formatDate(complaint.dateSubmitted),
        complaint.assignedTo,
        complaint.laborerName,
        complaint.jobTitle,
        complaint.resolvedAt ? formatDate(complaint.resolvedAt) : 'Not Resolved'
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Complaints exported successfully!', 'success');
  };

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'inactive': 'warning',
      'blocked': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
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
    <div className="user-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>👥 User Management</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-success" onClick={handleExportUsers}>
            📊 Export CSV
          </Button>
          <Button variant="outline-info" onClick={() => setShowNotificationModal(true)}>
            💬 Send Notification
          </Button>
          <Button variant="outline-warning" onClick={() => {
            setShowComplaintsModal(true);
            loadComplaints(true);
          }}>
            🔍 View Complaints
          </Button>
          <Button variant="outline-secondary" onClick={() => loadUsers(true)} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : '🔄'} Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">{stats.total}</h4>
              <small>Total Customers</small>
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
              <h4 className="text-danger">{stats.blocked}</h4>
              <small>Blocked</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">{stats.totalJobsPosted}</h4>
              <small>Total Jobs</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">₹{stats.totalSpent.toLocaleString()}</h4>
              <small>Total Spent</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search Customers</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, or phone..."
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
                  onChange={(e) => handleFilter('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Registration Date From</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilter('dateFrom', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Registration Date To</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilter('dateTo', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={2}>
              <Form.Group>
                <Form.Label>Min Jobs Posted</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={filters.minJobs}
                  onChange={(e) => handleFilter('minJobs', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Max Jobs Posted</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="100"
                  value={filters.maxJobs}
                  onChange={(e) => handleFilter('maxJobs', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={filters.sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="createdAt">Registration Date</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="status">Status</option>
                  <option value="jobsPosted">Jobs Posted</option>
                  <option value="totalSpent">Total Spent</option>
                  <option value="lastLogin">Last Login</option>
                </Form.Select>
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
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>&nbsp;</Form.Label>
                <Button
                  variant="outline-warning"
                  className="w-100"
                  onClick={() => {
                    setFilters({
                      search: '',
                      status: '',
                      dateFrom: '',
                      dateTo: '',
                      minJobs: '',
                      maxJobs: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc'
                    });
                  }}
                >
                  🔄 Clear Filters
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
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
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Activity</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="text-center">No customers found.</td></tr>
                  )}
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div>
                          <strong>{user.name}</strong>
                          {user.suspiciousActivity && (
                            <Badge bg="danger" className="ms-2">🚨 Suspicious</Badge>
                          )}
                          <br />
                          <small className="text-muted">ID: {user._id}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>{user.email}</div>
                          <small className="text-muted">{user.phone}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <Badge bg="info" className="me-1">{user.jobsPosted} Jobs</Badge>
                          <Badge bg="success">₹{user.totalSpent.toLocaleString()}</Badge>
                          {user.complaints.received > 0 && (
                            <div className="mt-1">
                              <Badge bg="warning">{user.complaints.received} Complaints</Badge>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleViewUser(user)}>
                              👁️ View Details
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedUser(user);
                              setShowBlockModal(true);
                            }}>
                              {user.status === 'blocked' ? '✅ Unblock User' : '🚫 Block User'}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedUser(user);
                              setShowJobsModal(true);
                            }}>
                              💼 View Posted Jobs
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedUser(user);
                              setShowMessageHistoryModal(true);
                            }}>
                              💬 Message History
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="text-danger"
                            >
                              🗑️ Delete User
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

      {/* Customer Details Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>👤 Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Row>
              <Col md={6}>
                <h6>Basic Information</h6>
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedUser.status)}</p>
                {selectedUser.blockReason && (
                  <Alert variant="warning" className="mt-2">
                    <strong>Block Reason:</strong> {selectedUser.blockReason}
                  </Alert>
                )}
              </Col>
              <Col md={6}>
                <h6>Account Information</h6>
                <p><strong>Customer ID:</strong> {selectedUser._id}</p>
                <p><strong>Registered:</strong> {formatDate(selectedUser.createdAt)}</p>
                <p><strong>Last Login:</strong> {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</p>
                {selectedUser.suspiciousActivity && (
                  <Alert variant="danger" className="mt-2">
                    <strong>🚨 Suspicious Activity Detected!</strong><br />
                    <small>This user has unusual login patterns or behavior.</small>
                  </Alert>
                )}
                {selectedUser.adminNotes && (
                  <Alert variant="info" className="mt-2">
                    <strong>Admin Notes:</strong> {selectedUser.adminNotes}
                  </Alert>
                )}
              </Col>
              <Col md={12} className="mt-3">
                <h6>Activity Summary</h6>
                <Row>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h5 className="text-primary">{selectedUser.jobsPosted}</h5>
                        <small>Jobs Posted</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h5 className="text-success">₹{selectedUser.totalSpent.toLocaleString()}</h5>
                        <small>Total Spent</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h5 className="text-warning">{selectedUser.complaints.received}</h5>
                        <small>Complaints Received</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h5 className="text-info">{selectedUser.complaints.filed}</h5>
                        <small>Complaints Filed</small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>

            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Close
          </Button>
          <Button 
            variant={selectedUser?.status === 'blocked' ? 'success' : 'warning'}
            onClick={() => {
              setShowUserModal(false);
              setShowBlockModal(true);
            }}
          >
            {selectedUser?.status === 'blocked' ? '✅ Unblock User' : '🚫 Block User'}
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => {
              setShowUserModal(false);
              setShowJobsModal(true);
            }}
          >
            💼 View Jobs
          </Button>
          <Button 
            variant="outline-info" 
            onClick={() => {
              setShowUserModal(false);
              setShowMessageHistoryModal(true);
            }}
          >
            💬 Messages
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Block/Unblock User Modal */}
      <Modal show={showBlockModal} onHide={() => setShowBlockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser?.status === 'blocked' ? '✅ Unblock User' : '🚫 Block User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                {selectedUser?.status === 'blocked' ? 'Reason for Unblocking' : 'Reason for Blocking'}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={blockData.reason}
                onChange={(e) => setBlockData({...blockData, reason: e.target.value})}
                placeholder={selectedUser?.status === 'blocked' ? 
                  'Why are you unblocking this user?' : 
                  'Why are you blocking this user? (e.g., spam, abuse, policy violation)'
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Admin Notes (Internal)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={blockData.adminNotes}
                onChange={(e) => setBlockData({...blockData, adminNotes: e.target.value})}
                placeholder="Internal notes for other admins..."
              />
            </Form.Group>
            {selectedUser?.status !== 'blocked' && (
              <Alert variant="warning">
                <strong>⚠️ Warning:</strong> Blocked users cannot log in or post new jobs.
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBlockModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={selectedUser?.status === 'blocked' ? 'success' : 'danger'}
            onClick={handleBlockUser}
          >
            {selectedUser?.status === 'blocked' ? '✅ Unblock User' : '🚫 Block User'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Posted Jobs Modal */}
      <Modal show={showJobsModal} onHide={() => setShowJobsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>💼 Posted Jobs by {selectedUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Posted Date</th>
                <th>Applications</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock job data */}
              <tr>
                <td>Plumbing Repair</td>
                <td>Home Maintenance</td>
                <td>₹2,500</td>
                <td><Badge bg="success">Completed</Badge></td>
                <td>2024-01-15</td>
                <td>5</td>
              </tr>
              <tr>
                <td>Kitchen Cleaning</td>
                <td>Cleaning</td>
                <td>₹1,200</td>
                <td><Badge bg="warning">In Progress</Badge></td>
                <td>2024-01-18</td>
                <td>3</td>
              </tr>
              <tr>
                <td>Garden Maintenance</td>
                <td>Gardening</td>
                <td>₹3,000</td>
                <td><Badge bg="primary">Open</Badge></td>
                <td>2024-01-20</td>
                <td>8</td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJobsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete User Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">🗑️ Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>⚠️ Warning:</strong> This action cannot be undone!
          </Alert>
          <p>Are you sure you want to permanently delete <strong>{selectedUser?.name}</strong>?</p>
          <p>This will:</p>
          <ul>
            <li>Remove the user account permanently</li>
            <li>Delete all posted jobs by this user</li>
            <li>Remove all associated data</li>
            <li>Cancel any ongoing transactions</li>
          </ul>
          <Form.Group className="mt-3">
            <Form.Label>Type "DELETE" to confirm:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Type DELETE to confirm"
              onChange={(e) => {
                const deleteBtn = document.getElementById('confirmDeleteBtn');
                if (deleteBtn) {
                  deleteBtn.disabled = e.target.value !== 'DELETE';
                }
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            id="confirmDeleteBtn"
            variant="danger" 
            onClick={handleDeleteUser}
            disabled={true}
          >
            🗑️ Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Message History Modal */}
      <Modal show={showMessageHistoryModal} onHide={() => setShowMessageHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>💬 Message History - {selectedUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {/* Mock message data */}
            <ListGroup>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <strong>To: Ravi Kumar (Plumber)</strong>
                  <small className="text-muted">2024-01-20 14:30</small>
                </div>
                <p className="mb-1">Hi, I need urgent plumbing repair for my kitchen sink. Can you come today?</p>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <strong>From: Ravi Kumar (Plumber)</strong>
                  <small className="text-muted">2024-01-20 14:45</small>
                </div>
                <p className="mb-1">Yes, I can come by 6 PM today. My rate is ₹500 for inspection.</p>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <strong>To: Geeta Sharma (Cleaner)</strong>
                  <small className="text-muted">2024-01-18 10:15</small>
                </div>
                <p className="mb-1">Can you clean my 2BHK apartment this weekend?</p>
              </ListGroup.Item>
            </ListGroup>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMessageHistoryModal(false)}>
            Close
          </Button>
          <Button variant="outline-primary" onClick={() => handleExportUsers()}>
            📊 Export Messages
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Send Notification Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📤 Send Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Send To</Form.Label>
              <Form.Select
                value={notificationData.type}
                onChange={(e) => setNotificationData({...notificationData, type: e.target.value})}
              >
                <option value="all">All Customers</option>
                <option value="active">Active Customers Only</option>
                <option value="inactive">Inactive Customers Only</option>
                <option value="specific">Specific Customer</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                value={notificationData.subject}
                onChange={(e) => setNotificationData({...notificationData, subject: e.target.value})}
                placeholder="Notification subject..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={notificationData.message}
                onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                placeholder="Your notification message..."
              />
            </Form.Group>
            <Alert variant="info">
              <strong>💡 Tip:</strong> Use notifications for platform updates, policy changes, or important announcements.
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendNotification}>
            📤 Send Notification
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View All Complaints Modal */}
      <Modal show={showComplaintsModal} onHide={() => setShowComplaintsModal(false)} size="xl" fullscreen="lg-down">
        <Modal.Header closeButton>
          <Modal.Title>🔍 All Complaints Management</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Complaints Filters */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Search Complaints</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by ID, user, subject..."
                  value={complaintsFilters.search}
                  onChange={(e) => handleComplaintsFilter('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={complaintsFilters.status}
                  onChange={(e) => handleComplaintsFilter('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Severity</Form.Label>
                <Form.Select
                  value={complaintsFilters.severity}
                  onChange={(e) => handleComplaintsFilter('severity', e.target.value)}
                >
                  <option value="">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Date From</Form.Label>
                <Form.Control
                  type="date"
                  value={complaintsFilters.dateFrom}
                  onChange={(e) => handleComplaintsFilter('dateFrom', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Date To</Form.Label>
                <Form.Control
                  type="date"
                  value={complaintsFilters.dateTo}
                  onChange={(e) => handleComplaintsFilter('dateTo', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={1}>
              <Form.Group>
                <Form.Label>&nbsp;</Form.Label>
                <Button
                  variant="outline-warning"
                  className="w-100"
                  onClick={() => {
                    setComplaintsFilters({
                      search: '',
                      status: '',
                      severity: '',
                      dateFrom: '',
                      dateTo: '',
                      sortBy: 'dateSubmitted',
                      sortOrder: 'desc'
                    });
                  }}
                >
                  Clear
                </Button>
              </Form.Group>
            </Col>
          </Row>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between mb-3">
            <div>
              <Badge bg="primary" className="me-2">Total: {complaintsPagination.totalComplaints}</Badge>
              <Badge bg="danger" className="me-2">Open: {mockComplaints.filter(c => c.status === 'open').length}</Badge>
              <Badge bg="warning" className="me-2">In Progress: {mockComplaints.filter(c => c.status === 'in_progress').length}</Badge>
              <Badge bg="success" className="me-2">Resolved: {mockComplaints.filter(c => c.status === 'resolved').length}</Badge>
              <Badge bg="dark">Escalated: {mockComplaints.filter(c => c.status === 'escalated').length}</Badge>
            </div>
            <div>
              <Button variant="outline-success" size="sm" onClick={handleExportComplaints} className="me-2">
                📊 Export CSV
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => loadComplaints(true)} disabled={complaintsLoading}>
                {complaintsLoading ? <Spinner animation="border" size="sm" /> : '🔄'} Refresh
              </Button>
            </div>
          </div>

          {/* Complaints Table */}
          {complaintsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading complaints...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleComplaintsSort('complaintId')}>
                      ID {complaintsFilters.sortBy === 'complaintId' && (complaintsFilters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleComplaintsSort('userName')}>
                      User {complaintsFilters.sortBy === 'userName' && (complaintsFilters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleComplaintsSort('severity')}>
                      Severity {complaintsFilters.sortBy === 'severity' && (complaintsFilters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleComplaintsSort('status')}>
                      Status {complaintsFilters.sortBy === 'status' && (complaintsFilters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleComplaintsSort('dateSubmitted')}>
                      Date {complaintsFilters.sortBy === 'dateSubmitted' && (complaintsFilters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 && (
                    <tr><td colSpan={8} className="text-center">No complaints found.</td></tr>
                  )}
                  {complaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td>
                        <small className="text-muted">{complaint.complaintId}</small>
                        {complaint.escalated && <Badge bg="danger" className="ms-1">🚨</Badge>}
                      </td>
                      <td>
                        <div>
                          <strong>{complaint.userName}</strong>
                          <br />
                          <small className="text-muted">{complaint.userEmail}</small>
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          <strong>{complaint.subject}</strong>
                          <br />
                          <small className="text-muted">
                            {complaint.description.length > 50 
                              ? complaint.description.substring(0, 50) + '...' 
                              : complaint.description}
                          </small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="info">{complaint.category}</Badge>
                      </td>
                      <td>
                        <Badge bg={
                          complaint.severity === 'critical' ? 'danger' :
                          complaint.severity === 'high' ? 'warning' :
                          complaint.severity === 'medium' ? 'primary' : 'secondary'
                        }>
                          {complaint.severity.charAt(0).toUpperCase() + complaint.severity.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={
                          complaint.status === 'resolved' ? 'success' :
                          complaint.status === 'in_progress' ? 'warning' :
                          complaint.status === 'escalated' ? 'danger' : 'secondary'
                        }>
                          {complaint.status.replace('_', ' ').charAt(0).toUpperCase() + complaint.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </td>
                      <td>{formatDate(complaint.dateSubmitted)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleViewComplaint(complaint)}>
                              👁️ View Details
                            </Dropdown.Item>
                            {complaint.status !== 'resolved' && (
                              <>
                                <Dropdown.Item onClick={() => handleUpdateComplaintStatus(complaint._id, 'in_progress')}>
                                  ⏳ Mark In Progress
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleUpdateComplaintStatus(complaint._id, 'resolved')}>
                                  ✅ Mark Resolved
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleUpdateComplaintStatus(complaint._id, 'escalated')}>
                                  🚨 Escalate
                                </Dropdown.Item>
                              </>
                            )}
                            {complaint.status === 'resolved' && (
                              <Dropdown.Item onClick={() => handleUpdateComplaintStatus(complaint._id, 'open')}>
                                🔄 Reopen
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Complaints Pagination */}
              {complaintsPagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => handleComplaintsPageChange(1)}
                      disabled={!complaintsPagination.hasPrevPage}
                    />
                    <Pagination.Prev 
                      onClick={() => handleComplaintsPageChange(complaintsPagination.currentPage - 1)}
                      disabled={!complaintsPagination.hasPrevPage}
                    />
                    
                    {Array.from({ length: Math.min(5, complaintsPagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === complaintsPagination.currentPage}
                          onClick={() => handleComplaintsPageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next 
                      onClick={() => handleComplaintsPageChange(complaintsPagination.currentPage + 1)}
                      disabled={!complaintsPagination.hasNextPage}
                    />
                    <Pagination.Last 
                      onClick={() => handleComplaintsPageChange(complaintsPagination.totalPages)}
                      disabled={!complaintsPagination.hasNextPage}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowComplaintsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Complaint Details Modal */}
      <Modal show={showComplaintDetailsModal} onHide={() => setShowComplaintDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📋 Complaint Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComplaint && (
            <div>
              {/* Complaint Header */}
              <Row className="mb-3">
                <Col md={6}>
                  <h5>{selectedComplaint.subject}</h5>
                  <p className="text-muted">ID: {selectedComplaint.complaintId}</p>
                </Col>
                <Col md={6} className="text-end">
                  <Badge bg={
                    selectedComplaint.severity === 'critical' ? 'danger' :
                    selectedComplaint.severity === 'high' ? 'warning' :
                    selectedComplaint.severity === 'medium' ? 'primary' : 'secondary'
                  } className="me-2">
                    {selectedComplaint.severity.charAt(0).toUpperCase() + selectedComplaint.severity.slice(1)} Priority
                  </Badge>
                  <Badge bg={
                    selectedComplaint.status === 'resolved' ? 'success' :
                    selectedComplaint.status === 'in_progress' ? 'warning' :
                    selectedComplaint.status === 'escalated' ? 'danger' : 'secondary'
                  }>
                    {selectedComplaint.status.replace('_', ' ').charAt(0).toUpperCase() + selectedComplaint.status.replace('_', ' ').slice(1)}
                  </Badge>
                  {selectedComplaint.escalated && (
                    <Badge bg="danger" className="ms-2">🚨 Escalated</Badge>
                  )}
                </Col>
              </Row>

              {/* User Information */}
              <Card className="mb-3">
                <Card.Header><strong>👤 Customer Information</strong></Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Name:</strong> {selectedComplaint.userName}</p>
                      <p><strong>Email:</strong> {selectedComplaint.userEmail}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>User ID:</strong> {selectedComplaint.userId}</p>
                      <p><strong>Submitted:</strong> {formatDate(selectedComplaint.dateSubmitted)}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Job/Laborer Information */}
              {selectedComplaint.jobId !== 'N/A' && selectedComplaint.jobId !== 'multiple' && (
                <Card className="mb-3">
                  <Card.Header><strong>💼 Related Job Information</strong></Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p><strong>Job Title:</strong> {selectedComplaint.jobTitle}</p>
                        <p><strong>Job ID:</strong> {selectedComplaint.jobId}</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>Laborer:</strong> {selectedComplaint.laborerName}</p>
                        <p><strong>Laborer ID:</strong> {selectedComplaint.laborerId}</p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* Complaint Details */}
              <Card className="mb-3">
                <Card.Header><strong>📝 Complaint Details</strong></Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Category:</strong> <Badge bg="info">{selectedComplaint.category}</Badge></p>
                      <p><strong>Assigned To:</strong> {selectedComplaint.assignedTo}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Status:</strong> <Badge bg={
                        selectedComplaint.status === 'resolved' ? 'success' :
                        selectedComplaint.status === 'in_progress' ? 'warning' :
                        selectedComplaint.status === 'escalated' ? 'danger' : 'secondary'
                      }>
                        {selectedComplaint.status.replace('_', ' ').charAt(0).toUpperCase() + selectedComplaint.status.replace('_', ' ').slice(1)}
                      </Badge></p>
                      {selectedComplaint.resolvedAt && (
                        <p><strong>Resolved At:</strong> {formatDate(selectedComplaint.resolvedAt)}</p>
                      )}
                    </Col>
                  </Row>
                  <hr />
                  <h6>Description:</h6>
                  <p className="bg-light p-3 rounded">{selectedComplaint.description}</p>
                </Card.Body>
              </Card>

              {/* Admin Notes */}
              {selectedComplaint.adminNotes && (
                <Card className="mb-3">
                  <Card.Header><strong>🔒 Admin Notes (Internal)</strong></Card.Header>
                  <Card.Body>
                    <p className="bg-warning bg-opacity-10 p-3 rounded">{selectedComplaint.adminNotes}</p>
                  </Card.Body>
                </Card>
              )}

              {/* Resolution */}
              {selectedComplaint.resolution && (
                <Card className="mb-3">
                  <Card.Header><strong>✅ Resolution</strong></Card.Header>
                  <Card.Body>
                    <p className="bg-success bg-opacity-10 p-3 rounded">{selectedComplaint.resolution}</p>
                    {selectedComplaint.resolvedAt && (
                      <small className="text-muted">Resolved on: {formatDate(selectedComplaint.resolvedAt)}</small>
                    )}
                  </Card.Body>
                </Card>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowComplaintDetailsModal(false)}>
            Close
          </Button>
          {selectedComplaint && selectedComplaint.status !== 'resolved' && (
            <>
              <Button 
                variant="warning" 
                onClick={() => {
                  handleUpdateComplaintStatus(selectedComplaint._id, 'in_progress');
                  setShowComplaintDetailsModal(false);
                }}
              >
                ⏳ Mark In Progress
              </Button>
              <Button 
                variant="success" 
                onClick={() => {
                  handleUpdateComplaintStatus(selectedComplaint._id, 'resolved');
                  setShowComplaintDetailsModal(false);
                }}
              >
                ✅ Mark Resolved
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  handleUpdateComplaintStatus(selectedComplaint._id, 'escalated');
                  setShowComplaintDetailsModal(false);
                }}
              >
                🚨 Escalate
              </Button>
            </>
          )}
          {selectedComplaint && selectedComplaint.status === 'resolved' && (
            <Button 
              variant="outline-primary" 
              onClick={() => {
                handleUpdateComplaintStatus(selectedComplaint._id, 'open');
                setShowComplaintDetailsModal(false);
              }}
            >
              🔄 Reopen
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
