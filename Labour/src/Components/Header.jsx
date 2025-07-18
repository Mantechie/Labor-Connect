// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';

const LANGUAGES = [
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
  },
  HI: {
    home: 'होम',
    jobs: 'नौकरियां',
    findLabour: 'मजदूर खोजें',
    postWork: 'काम पोस्ट करें',
    help: 'सहायता',
    login: 'लॉगिन',
    signup: 'साइन अप',
  },
  RAJ: {
    home: 'घर',
    jobs: 'नौकरियां',
    findLabour: 'मजदूर खोजो',
    postWork: 'काम पोस्ट करो',
    help: 'मदद',
    login: 'लॉगिन',
    signup: 'साइन अप',
  },
};

const Header = () => {
  const [currentLang, setCurrentLang] = useState('EN');
  const [langOpen, setLangOpen] = useState(false);
  const langBtnRef = useRef(null);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const storedLang = localStorage.getItem('labour_lang');
    if (storedLang && LANGUAGES.some(l => l.code === storedLang)) {
      setCurrentLang(storedLang);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target) &&
        langBtnRef.current &&
        !langBtnRef.current.contains(e.target)
      ) {
        setLangOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === 'Escape') setLangOpen(false);
    }
    if (langOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [langOpen]);

  const handleLangChange = (code) => {
    setCurrentLang(code);
    localStorage.setItem('labour_lang', code);
    setLangOpen(false);
  };

  const t = TRANSLATIONS[currentLang];

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top shadow-sm py-2" style={{ background: '#fff' }}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: '2rem' }}>🛠️</span>
          <span style={{ color: '#0D47A1', fontWeight: 700, letterSpacing: '1px' }}>LabourConnect</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          <ul className="navbar-nav gap-2">
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/">
                <span role="img" aria-label="Home">🏠</span> {t.home}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/job-listings">
                <span role="img" aria-label="Jobs">🛠️</span> {t.jobs}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/laborer-profile">
                <span role="img" aria-label="Laborers">👷‍♂️</span> {t.findLabour}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/job-post">
                <span role="img" aria-label="Post Work">➕</span> {t.postWork}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/help">
                <span role="img" aria-label="Help">❓</span> {t.help}
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {/* React-only Language Dropdown */}
            <div className="position-relative me-2">
              <button
                ref={langBtnRef}
                className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-2"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                onClick={() => setLangOpen((open) => !open)}
              >
                <span role="img" aria-label="Language">🌐</span>
                <span>
                  <b>{currentLang}</b>
                  {currentLang !== 'EN' && <span> | EN</span>}
                  {currentLang !== 'HI' && <span> | HI</span>}
                </span>
                <span className="ms-1" aria-hidden="true">▾</span>
              </button>
              {langOpen && (
                <ul
                  ref={langMenuRef}
                  className="list-group position-absolute end-0 mt-2 shadow rounded-3"
                  style={{ minWidth: 180, zIndex: 2000 }}
                  tabIndex={-1}
                  role="listbox"
                >
                  {LANGUAGES.map(lang => (
                    <li key={lang.code}>
                      <button
                        className={`list-group-item list-group-item-action d-flex align-items-center gap-2${currentLang === lang.code ? ' active' : ''}`}
                        type="button"
                        role="option"
                        aria-selected={currentLang === lang.code}
                        onClick={() => handleLangChange(lang.code)}
                        tabIndex={0}
                      >
                        <span role="img" aria-label={lang.label}>{lang.icon}</span> {lang.label}
                      </button>
                    </li>
                  ))}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <span className="list-group-item text-muted small">More languages coming soon</span>
                  </li>
                </ul>
              )}
            </div>
            <Link to="/login" className="btn btn-outline-primary rounded-pill px-4 fw-semibold">{t.login}</Link>
            <Link to="/signup" className="btn btn-primary rounded-pill px-4 fw-semibold">{t.signup}</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
