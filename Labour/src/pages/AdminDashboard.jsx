import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserManagement from '../Components/UserManagement';
import LaborerManagement from '../Components/LaborerManagement';
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
  Spinner,
  Nav,
  Navbar,
  Container,
  Dropdown
} from 'react-bootstrap';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    // Get admin user from localStorage
    const storedAdmin = localStorage.getItem('adminUser');
    if (storedAdmin) {
      setAdminUser(JSON.parse(storedAdmin));
    }
    
    // Check if admin is authenticated
    const hasToken = !!localStorage.getItem('adminToken');
    const hasUser = !!localStorage.getItem('adminUser');
    
    if (!hasToken || !hasUser) {
      window.location.href = '/admin/login';
      return;
    }
    
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    // Clear admin data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  // Get the current user name
  const currentUserName = adminUser?.name || 'Admin';

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
    <div className="admin-dashboard">
      {/* Admin Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="admin-navbar">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.5rem' }}>⚙️</span>
            <span style={{ fontWeight: 700 }}>Admin Dashboard</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')}
              >
                🏠 Dashboard
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'users'} 
                onClick={() => setActiveTab('users')}
              >
                👤 Manage Users
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'laborers'} 
                onClick={() => setActiveTab('laborers')}
              >
                🧰 Manage Laborers
              </Nav.Link>
            </Nav>
            
            <Nav>
              <Dropdown>
                <Dropdown.Toggle variant="outline-light" id="admin-dropdown">
                  👤 {currentUserName}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/admin/profile">
                    👤 Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setShowSettingsModal(true)}>
                    ⚙️ Settings
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    🚪 Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container fluid className="py-4">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="overview" title="📊 Overview">
            <div>
              <h4 className="mb-4">📊 Dashboard Overview</h4>
              
              {/* Stats Cards */}
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6 className="text-muted">Total Users</h6>
                      <h3 className="text-primary">150</h3>
                      <p className="text-muted small">Registered users</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6 className="text-muted">Verified Laborers</h6>
                      <h3 className="text-success">89</h3>
                      <p className="text-muted small">Verified profiles</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6 className="text-muted">Pending Requests</h6>
                      <h3 className="text-warning">12</h3>
                      <p className="text-muted small">Awaiting approval</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6 className="text-muted">Total Jobs</h6>
                      <h3 className="text-info">234</h3>
                      <p className="text-muted small">Active listings</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Card>
                    <Card.Header>
                      <h6 className="mb-0">🕒 Recent Activity</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3 p-2 border-bottom">
                        <div className="me-3">
                          <Badge bg="success">active</Badge>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">New User Registration</h6>
                          <p className="text-muted mb-1">User John Doe registered successfully</p>
                          <small className="text-muted">
                            John Doe • {new Date().toLocaleString()}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3 p-2 border-bottom">
                        <div className="me-3">
                          <Badge bg="warning">pending</Badge>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">Job Posted</h6>
                          <p className="text-muted mb-1">New job posted for electrician</p>
                          <small className="text-muted">
                            Jane Smith • {new Date(Date.now() - 3600000).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Tab>
          <Tab eventKey="users" title="👥 Users">
            <UserManagement />
          </Tab>
          <Tab eventKey="laborers" title="🔧 Laborers">
            <LaborerManagement />
          </Tab>
        </Tabs>
      </Container>

      {/* Settings Modal */}
      <Modal show={showSettingsModal} onHide={() => setShowSettingsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>⚙️ Admin Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Admin Name</Form.Label>
              <Form.Control type="text" value={adminUser?.name || ''} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={adminUser?.email || ''} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control type="text" value={adminUser?.role || ''} readOnly />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard; 