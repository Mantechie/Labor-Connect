// src/components/Header.jsx
import React, { useState, /*useEffect*/ } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

/*const LANGUAGES = [
  { code: 'EN', label: 'EN - English', icon: '🇬🇧' },
  { code: 'HI', label: 'HI - हिन्दी', icon: '🇮🇳' },
  { code: 'RAJ', label: 'RAJ - राजस्थानी', icon: '🌾' },
];

const TRANSLATIONS = {
  EN: {
    home: 'Home',
    jobs: 'Jobs',
    findLabour: 'Find Labour',
    postWork: 'Post Work',
    help: 'Help',
    login: 'Login',
    signup: 'Sign Up',
    browseLaborers: 'Browse Laborers',
    myJobs: 'My Jobs',
    postJob: 'Post Job',
    applyJobs: 'Apply for Jobs',
    myRatings: 'My Ratings',
    portfolio: 'Portfolio',
    documents: 'Documents',
    profile: 'Profile',
    messages: 'Messages',
    adminDashboard: 'Admin Dashboard',
    logout: 'Logout',
  },
  HI: {
    home: 'होम',
    jobs: 'नौकरियां',
    findLabour: 'मजदूर खोजें',
    postWork: 'काम पोस्ट करें',
    help: 'सहायता',
    login: 'लॉगिन',
    signup: 'साइन अप',
    browseLaborers: 'मजदूर देखें',
    myJobs: 'मेरे काम',
    postJob: 'काम पोस्ट करें',
    applyJobs: 'नौकरी के लिए आवेदन करें',
    myRatings: 'मेरी रेटिंग',
    portfolio: 'पोर्टफोलियो',
    documents: 'दस्तावेज',
    profile: 'प्रोफाइल',
    messages: 'संदेश',
    adminDashboard: 'एडमिन डैशबोर्ड',
    logout: 'लॉगआउट',
  },
  RAJ: {
    home: 'घर',
    jobs: 'नौकरियां',
    findLabour: 'मजदूर खोजो',
    postWork: 'काम पोस्ट करो',
    help: 'मदद',
    login: 'लॉगिन',
    signup: 'साइन अप',
    browseLaborers: 'मजदूर देखो',
    myJobs: 'मेरे काम',
    postJob: 'काम पोस्ट करो',
    applyJobs: 'नौकरी के लिए आवेदन करो',
    myRatings: 'मेरी रेटिंग',
    portfolio: 'पोर्टफोलियो',
    documents: 'दस्तावेज',
    profile: 'प्रोफाइल',
    messages: 'संदेश',
    adminDashboard: 'एडमिन डैशबोर्ड',
    logout: 'लॉगआउट',
  },
};*/

const Header = () => {
  //const [currentLang, setCurrentLang] = useState('EN');
  const [expanded, setExpanded] = useState(false);
  const { user, logout } = useAuth();

  /*useEffect(() => {
    const storedLang = localStorage.getItem('labour_lang');
    if (storedLang && LANGUAGES.some(l => l.code === storedLang)) {
      setCurrentLang(storedLang);
    }
  }, []);

  const handleLangChange = (code) => {
    setCurrentLang(code);
    localStorage.setItem('labour_lang', code);
  };

  const t = TRANSLATIONS[currentLang]; */

  // Simple static translations for now
  const t = {
    home: 'Home',
    jobs: 'Jobs',
    findLabour: 'Find Labour',
    postWork: 'Post Work',
    help: 'Help',
    login: 'Login',
    signup: 'Sign Up',
    browseLaborers: 'Browse Laborers',
    myJobs: 'My Jobs',
    postJob: 'Post Job',
    applyJobs: 'Apply for Jobs',
    myRatings: 'My Ratings',
    portfolio: 'Portfolio',
    documents: 'Documents',
    profile: 'Profile',
    messages: 'Messages',
    adminDashboard: 'Admin Dashboard',
    logout: 'Logout',
  };

  return (
    <Navbar
      bg="light"
      expand="lg"
      sticky="top"
      className="shadow-sm py-2"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center gap-2">
          <span style={{ fontSize: '2rem' }}>🛠️</span>
          <span style={{ color: '#0D47A1', fontWeight: 700, letterSpacing: '1px' }}>LabourConnect</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto gap-2">
            <Nav.Link as={NavLink} to="/" onClick={() => setExpanded(false)}>🏠 {t.home}</Nav.Link>
            {!user && (
              <>
                <Nav.Link as={NavLink} to="/job-listings" onClick={() => setExpanded(false)}>🛠️ {t.jobs}</Nav.Link>
                <Nav.Link as={NavLink} to="/laborer-profile" onClick={() => setExpanded(false)}>👷‍♂️ {t.findLabour}</Nav.Link>
              </>
            )}
            {user && user.role === 'user' && (
              <>
                <Nav.Link as={NavLink} to="/browse-laborers" onClick={() => setExpanded(false)}>👷 {t.browseLaborers}</Nav.Link>
                <Nav.Link as={NavLink} to="/job-post" onClick={() => setExpanded(false)}>➕ {t.postJob}</Nav.Link>
              </>
            )}
            {user && user.role === 'laborer' && (
              <>
                <Nav.Link as={NavLink} to="/job-listings" onClick={() => setExpanded(false)}>📋 {t.applyJobs}</Nav.Link>
                <Nav.Link as={NavLink} to="/ratings" onClick={() => setExpanded(false)}>⭐ {t.myRatings}</Nav.Link>
                <Nav.Link as={NavLink} to="/portfolio" onClick={() => setExpanded(false)}>📸 {t.portfolio}</Nav.Link>
                <Nav.Link as={NavLink} to="/documents" onClick={() => setExpanded(false)}>📄 {t.documents}</Nav.Link>
              </>
            )}
            <Nav.Link as={NavLink} to="/help" onClick={() => setExpanded(false)}>❓ {t.help}</Nav.Link>
          </Nav>
          <Nav className="ms-auto align-items-center gap-2">
        {/*
          <NavDropdown
              title={<span><span role="img" aria-label="Language">🌐</span> <b>{currentLang}</b></span>}
              id="language-dropdown"
              align="end"
              className="mb-2 mb-lg-0"
            >
              {LANGUAGES.map(lang => (
                <NavDropdown.Item
                  key={lang.code}
                  active={currentLang === lang.code}
                  onClick={() => {
                    handleLangChange(lang.code);
                    setTimeout(() => setExpanded(false), 100);
                  }}
                >
                  <span role="img" aria-label={lang.label}>{lang.icon}</span> {lang.label}
                </NavDropdown.Item>
              ))}
              <NavDropdown.Divider />
              <NavDropdown.Item disabled className="text-muted small">
                More languages coming soon
              </NavDropdown.Item>
            </NavDropdown>
            */}
            {user ? (
              <>
                <NavDropdown
                  title={<span>👤 {user.name}</span>}
                  id="user-dropdown"
                  align="end"
                  className="mb-2 mb-lg-0"
                >
                  <NavDropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}>
                    📋 Profile
                  </NavDropdown.Item>
                  {user.role === 'laborer' ? (
                    <NavDropdown.Item as={NavLink} to="/laborer-dashboard" onClick={() => setExpanded(false)}>
                      👷 Laborer Dashboard
                    </NavDropdown.Item>
                  ) : (
                    <NavDropdown.Item as={NavLink} to="/user-dashboard" onClick={() => setExpanded(false)}>
                      🏠 My Dashboard
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item as={Link} to="/chat" onClick={() => setExpanded(false)}>
                    💬 Messages
                  </NavDropdown.Item>
                  {user.role === 'admin' && (
                    <NavDropdown.Item as={Link} to="/admin" onClick={() => setExpanded(false)}>
                      ⚙️ Admin Dashboard
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => {
                    logout();
                    setExpanded(false);
                  }}>
                    🚪 Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)}>
                  <Button variant="outline-primary" className="rounded-pill px-4 fw-semibold w-100 mb-2 mb-lg-0">{t.login}</Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/signup" onClick={() => setExpanded(false)}>
                  <Button variant="primary" className="rounded-pill px-4 fw-semibold w-100 mb-2 mb-lg-0">{t.signup}</Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/login" onClick={() => setExpanded(false)}>
                  <Button variant="outline-secondary" className="rounded-pill px-3 fw-semibold w-100">
                    ⚙️ Admin
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
