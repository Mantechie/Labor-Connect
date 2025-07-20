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
  Tabs,
  Tab,
  ListGroup,
  ProgressBar
} from 'react-bootstrap';

const UserManagement = () => {
  const { showToast } = useToast();
  
  // Mock data for demonstration
  const mockUsers = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 43210',
      role: 'user',
      status: 'active',
      isVerified: true,
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: '2024-01-20T14:25:00Z',
      profilePhoto: 'https://via.placeholder.com/100',
      documents: {
        aadhar: { status: 'approved', url: 'https://example.com/aadhar1.pdf' },
        idProof: { status: 'pending', url: 'https://example.com/id1.pdf' },
        workLicense: { status: 'rejected', url: 'https://example.com/license1.pdf' }
      },
      activity: {
        totalJobsPosted: 5,
        totalReviews: 12,
        loginCount: 45
      },
      complaints: {
        received: 2,
        filed: 1
      }
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+91 87654 32109',
      role: 'laborer',
      status: 'active',
      isVerified: false,
      createdAt: '2024-01-10T09:15:00Z',
      lastLogin: '2024-01-19T16:45:00Z',
      profilePhoto: 'https://via.placeholder.com/100',
      documents: {
        aadhar: { status: 'pending', url: 'https://example.com/aadhar2.pdf' },
        idProof: { status: 'pending', url: 'https://example.com/id2.pdf' },
        workLicense: { status: 'pending', url: 'https://example.com/license2.pdf' }
      },
      activity: {
        totalJobsPosted: 0,
        totalReviews: 8,
        loginCount: 23
      },
      complaints: {
        received: 0,
        filed: 0
      }
    },
    {
      _id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+91 76543 21098',
      role: 'laborer',
      status: 'suspended',
      isVerified: true,
      createdAt: '2024-01-05T11:20:00Z',
      lastLogin: '2024-01-18T12:30:00Z',
      profilePhoto: 'https://via.placeholder.com/100',
      documents: {
        aadhar: { status: 'approved', url: 'https://example.com/aadhar3.pdf' },
        idProof: { status: 'approved', url: 'https://example.com/id3.pdf' },
        workLicense: { status: 'approved', url: 'https://example.com/license3.pdf' }
      },
      activity: {
        totalJobsPosted: 0,
        totalReviews: 15,
        loginCount: 67
      },
      complaints: {
        received: 3,
        filed: 1
      }
    }
  ];

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    verified: 0,
    unverified: 0
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
    role: '',
    verification: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showComplaintsModal, setShowComplaintsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    reason: ''
  });
  const [roleData, setRoleData] = useState({
    role: '',
    reason: ''
  });
  const [documentData, setDocumentData] = useState({
    documentType: '',
    status: '',
    notes: ''
  });
  const [notificationData, setNotificationData] = useState({
    subject: '',
    message: '',
    type: 'all'
  });
  const [bulkData, setBulkData] = useState({
    status: '',
    reason: ''
  });

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.currentPage]);

  const loadUsers = async () => {
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
        const matchesRole = !filters.role || user.role === filters.role;
        const matchesVerification = filters.verification === '' || 
          (filters.verification === 'verified' && user.isVerified) ||
          (filters.verification === 'unverified' && !user.isVerified);
        
        return matchesSearch && matchesStatus && matchesRole && matchesVerification;
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
        suspended: mockUsers.filter(u => u.status === 'suspended').length,
        verified: mockUsers.filter(u => u.isVerified).length,
        unverified: mockUsers.filter(u => !u.isVerified).length
      });
    } catch (error) {
      console.error('Error loading users:', error);
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

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      // Update user status in mock data
      const updatedUsers = mockUsers.map(user => 
        user._id === selectedUser._id 
          ? { ...user, status: statusData.status, statusReason: statusData.reason }
          : user
      );
      
      // In real implementation, this would be an API call
      console.log('Updating user status:', { userId: selectedUser._id, ...statusData });
      
      setShowStatusModal(false);
      setStatusData({ status: '', reason: '' });
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleUpdateRole = async () => {
    try {
      // Update user role in mock data
      const updatedUsers = mockUsers.map(user => 
        user._id === selectedUser._id 
          ? { ...user, role: roleData.role }
          : user
      );
      
      console.log('Updating user role:', { userId: selectedUser._id, ...roleData });
      
      setShowRoleModal(false);
      setRoleData({ role: '', reason: '' });
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleVerifyDocument = async () => {
    try {
      console.log('Verifying document:', { userId: selectedUser._id, ...documentData });
      
      setShowDocumentModal(false);
      setDocumentData({ documentType: '', status: '', notes: '' });
      loadUsers();
    } catch (error) {
      console.error('Error verifying document:', error);
    }
  };

  const handleSendNotification = async () => {
    try {
      console.log('Sending notification:', notificationData);
      
      setShowNotificationModal(false);
      setNotificationData({ subject: '', message: '', type: 'all' });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      console.log('Bulk updating users:', { userIds: selectedUsers, ...bulkData });
      
      setShowBulkModal(false);
      setBulkData({ status: '', reason: '' });
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Error bulk updating users:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      console.log('Deleting user:', userId);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleExportUsers = () => {
    // Create CSV content
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Verified', 'Join Date', 'Last Login'],
      ...users.map(user => [
        user.name,
        user.email,
        user.phone,
        user.role,
        user.status,
        user.isVerified ? 'Yes' : 'No',
        formatDate(user.createdAt),
        user.lastLogin ? formatDate(user.lastLogin) : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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

  const getVerificationBadge = (isVerified) => {
    return isVerified ? 
      <Badge bg="success">✓ Verified</Badge> : 
      <Badge bg="warning">⚠ Unverified</Badge>;
  };

  const getRoleBadge = (role) => {
    const variants = {
      'user': 'primary',
      'laborer': 'info',
      'admin': 'danger'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  const getDocumentStatusBadge = (status) => {
    const variants = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'danger'
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

  return (
    <div className="user-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>👥 User Management</h2>
        <div className="d-flex gap-2">
          {selectedUsers.length > 0 && (
            <Button 
              variant="outline-primary" 
              onClick={() => setShowBulkModal(true)}
            >
              📝 Bulk Update ({selectedUsers.length})
            </Button>
          )}
          <Button variant="outline-success" onClick={handleExportUsers}>
            📊 Export CSV
          </Button>
          <Button variant="outline-info" onClick={() => setShowNotificationModal(true)}>
            💬 Send Notification
          </Button>
          <Button variant="primary" onClick={loadUsers}>
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
              <small>Total Users</small>
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
              <h4 className="text-secondary">{stats.unverified}</h4>
              <small>Unverified</small>
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
                <Form.Label>Search Users</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={filters.search}
                  onChange={handleSearch}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status Filter</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilter('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Role Filter</Form.Label>
                <Form.Select
                  value={filters.role}
                  onChange={(e) => handleFilter('role', e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="laborer">Laborer</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Verification Filter</Form.Label>
                <Form.Select
                  value={filters.verification}
                  onChange={(e) => handleFilter('verification', e.target.value)}
                >
                  <option value="">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </Form.Select>
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
                  <option value="role">Role</option>
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
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
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
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleUserSelect(user._id)}
                        />
                      </td>
                      <td>
                        <div>
                          <strong>{user.name}</strong>
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
                      <td>{getStatusBadge(user.status)}</td>
                      <td>{getVerificationBadge(user.isVerified)}</td>
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
                              setShowStatusModal(true);
                            }}>
                              🔄 Update Status
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}>
                              🎭 Update Role
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedUser(user);
                              setShowDocumentModal(true);
                            }}>
                              📄 Verify Documents
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedUser(user);
                              setShowComplaintsModal(true);
                            }}>
                              👮‍♂️ View Complaints
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedUser(user);
                              setShowActivityModal(true);
                            }}>
                              📊 View Activity
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleDeleteUser(user._id)}
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

      {/* User Details Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>👤 User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Row>
              <Col md={6}>
                <h6>Basic Information</h6>
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                <p><strong>Role:</strong> {getRoleBadge(selectedUser.role)}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedUser.status)}</p>
                <p><strong>Verification:</strong> {getVerificationBadge(selectedUser.isVerified)}</p>
              </Col>
              <Col md={6}>
                <h6>Account Information</h6>
                <p><strong>User ID:</strong> {selectedUser._id}</p>
                <p><strong>Registered:</strong> {formatDate(selectedUser.createdAt)}</p>
                <p><strong>Last Login:</strong> {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</p>
                {selectedUser.statusReason && (
                  <p><strong>Status Reason:</strong> {selectedUser.statusReason}</p>
                )}
              </Col>
              {selectedUser.activity && (
                <Col md={12} className="mt-3">
                  <h6>Activity</h6>
                  <p><strong>Total Jobs Posted:</strong> {selectedUser.activity.totalJobsPosted}</p>
                  <p><strong>Total Reviews:</strong> {selectedUser.activity.totalReviews}</p>
                  <p><strong>Total Logins:</strong> {selectedUser.activity.loginCount}</p>
                </Col>
              )}
              {selectedUser.documents && (
                <Col md={12} className="mt-3">
                  <h6>Documents</h6>
                  <ListGroup>
                    {Object.entries(selectedUser.documents).map(([type, doc]) => (
                      <ListGroup.Item key={type} className="d-flex justify-content-between align-items-center">
                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}: {getDocumentStatusBadge(doc.status)}</span>
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary">View</a>
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Col>
              )}
              {selectedUser.complaints && (
                <Col md={12} className="mt-3">
                  <h6>Complaints</h6>
                  <p><strong>Received:</strong> {selectedUser.complaints.received}</p>
                  <p><strong>Filed:</strong> {selectedUser.complaints.filed}</p>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowUserModal(false);
              setShowStatusModal(true);
            }}
          >
            Update Status
          </Button>
          <Button 
            variant="info" 
            onClick={() => {
              setShowUserModal(false);
              setShowRoleModal(true);
            }}
          >
            Update Role
          </Button>
          <Button 
            variant="warning" 
            onClick={() => {
              setShowUserModal(false);
              setShowDocumentModal(true);
            }}
          >
            Verify Documents
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              setShowUserModal(false);
              setShowComplaintsModal(true);
            }}
          >
            View Complaints
          </Button>
          <Button 
            variant="success" 
            onClick={() => {
              setShowUserModal(false);
              setShowActivityModal(true);
            }}
          >
            View Activity
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🔄 Update User Status</Modal.Title>
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
                <option value="blocked">Blocked</option>
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

      {/* Update Role Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🎭 Update User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={roleData.role}
                onChange={(e) => setRoleData(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="laborer">Laborer</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={roleData.reason}
                onChange={(e) => setRoleData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for role change..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateRole}>
            Update Role
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Verify Documents Modal */}
      <Modal show={showDocumentModal} onHide={() => setShowDocumentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📄 Verify User Documents</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Document Type</Form.Label>
              <Form.Select
                value={documentData.documentType}
                onChange={(e) => setDocumentData(prev => ({ ...prev, documentType: e.target.value }))}
              >
                <option value="">Select Document</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="idProof">ID Proof</option>
                <option value="workLicense">Work License</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={documentData.status}
                onChange={(e) => setDocumentData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={documentData.notes}
                onChange={(e) => setDocumentData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes for document verification..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDocumentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleVerifyDocument}>
            Verify Document
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Complaints Modal */}
      <Modal show={showComplaintsModal} onHide={() => setShowComplaintsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>👮‍♂️ User Complaints</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="received" id="complaints-tabs">
            <Tab eventKey="received" title="Received Complaints">
              <ListGroup>
                {selectedUser?.complaints?.received > 0 ? (
                  Array.from({ length: selectedUser.complaints.received }, (_, i) => (
                    <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center">
                      <span>Complaint {i + 1}</span>
                      <Badge bg="warning">Pending</Badge>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>No received complaints.</ListGroup.Item>
                )}
              </ListGroup>
            </Tab>
            <Tab eventKey="filed" title="Filed Complaints">
              <ListGroup>
                {selectedUser?.complaints?.filed > 0 ? (
                  Array.from({ length: selectedUser.complaints.filed }, (_, i) => (
                    <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center">
                      <span>Complaint {i + 1}</span>
                      <Badge bg="success">Resolved</Badge>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>No filed complaints.</ListGroup.Item>
                )}
              </ListGroup>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowComplaintsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Activity Modal */}
      <Modal show={showActivityModal} onHide={() => setShowActivityModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📊 User Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="overview" id="activity-tabs">
            <Tab eventKey="overview" title="Overview">
              <Row>
                <Col md={6}>
                  <h6>Total Jobs Posted</h6>
                  <ProgressBar now={selectedUser?.activity?.totalJobsPosted || 0} label={`${selectedUser?.activity?.totalJobsPosted || 0}/10`} />
                </Col>
                <Col md={6}>
                  <h6>Total Reviews</h6>
                  <ProgressBar now={selectedUser?.activity?.totalReviews || 0} label={`${selectedUser?.activity?.totalReviews || 0}/20`} />
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <h6>Total Logins</h6>
                  <ProgressBar now={selectedUser?.activity?.loginCount || 0} label={`${selectedUser?.activity?.loginCount || 0}/100`} />
                </Col>
              </Row>
            </Tab>
            <Tab eventKey="details" title="Detailed Activity">
              <ListGroup>
                <ListGroup.Item>
                  <strong>Total Jobs Posted:</strong> {selectedUser?.activity?.totalJobsPosted || 0}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Total Reviews:</strong> {selectedUser?.activity?.totalReviews || 0}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Total Logins:</strong> {selectedUser?.activity?.loginCount || 0}
                </ListGroup.Item>
              </ListGroup>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActivityModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📝 Bulk Update Users</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            You are about to update {selectedUsers.length} users.
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
                <option value="blocked">Blocked</option>
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
            Update {selectedUsers.length} Users
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Send Notification Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>💬 Send Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                value={notificationData.subject}
                onChange={(e) => setNotificationData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Notification subject"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={notificationData.message}
                onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notification Type</Form.Label>
              <Form.Select
                value={notificationData.type}
                onChange={(e) => setNotificationData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
                <option value="suspended">Suspended Users</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendNotification}>
            Send Notification
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement; 