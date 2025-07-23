import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../Components/ToastContext';
import axiosInstance from '../utils/axiosInstance';
import CorsStatus from '../Components/CorsStatus';
import { 
  Card, 
  Row, 
  Col, 
  Form, 
  Button, 
  Badge, 
  Modal, 
  InputGroup,
  Pagination,
  Alert,
  Spinner,
  Container
} from 'react-bootstrap';

// Enhanced dummy data for fallback
const dummyLaborers = [
  {
    _id: '1',
    name: 'Rajesh Kumar',
    skills: ['Plumber', 'Welder'],
    location: 'Mumbai',
    rating: 4.2,
    reviewCount: 12,
    hourlyRate: 300,
    dailyRate: 2000,
    availability: 'available',
    bio: 'Experienced plumber and welder with 8+ years of experience.',
    phone: '9876543210',
    email: 'rajesh@example.com',
    profilePhoto: null,
    reviews: [
      { reviewerName: 'Amit', rating: 4, comment: 'Good work', date: '2023-05-01' },
      { reviewerName: 'Sunita', rating: 5, comment: 'Excellent service', date: '2023-06-15' }
    ]
  },
  {
    _id: '2',
    name: 'Sita Devi',
    skills: ['Electrician'],
    location: 'Delhi',
    rating: 4.8,
    reviewCount: 20,
    hourlyRate: 350,
    dailyRate: 2500,
    availability: 'busy',
    bio: 'Certified electrician with 10 years experience in residential and commercial projects.',
    phone: '9876543211',
    email: 'sita@example.com',
    profilePhoto: null,
    reviews: [
      { reviewerName: 'Ravi', rating: 5, comment: 'Highly recommended', date: '2023-04-20' }
    ]
  },
  {
    _id: '3',
    name: 'Manoj Singh',
    skills: ['Mason', 'Carpenter'],
    location: 'Bangalore',
    rating: 3.5,
    reviewCount: 5,
    hourlyRate: 250,
    dailyRate: 1800,
    availability: 'available',
    bio: 'Skilled mason and carpenter specializing in home construction.',
    phone: '9876543212',
    email: 'manoj@example.com',
    profilePhoto: null,
    reviews: []
  },
  {
    _id: '4',
    name: 'Priya Sharma',
    skills: ['Painter', 'Cleaner'],
    location: 'Chennai',
    rating: 4.5,
    reviewCount: 15,
    hourlyRate: 200,
    dailyRate: 1500,
    availability: 'available',
    bio: 'Professional painter and cleaner with attention to detail.',
    phone: '9876543213',
    email: 'priya@example.com',
    profilePhoto: null,
    reviews: [
      { reviewerName: 'Kiran', rating: 4, comment: 'Great painting work', date: '2023-07-10' }
    ]
  },
  {
    _id: '5',
    name: 'Vikram Patel',
    skills: ['Gardener'],
    location: 'Pune',
    rating: 4.0,
    reviewCount: 8,
    hourlyRate: 180,
    dailyRate: 1200,
    availability: 'available',
    bio: 'Expert gardener with knowledge of various plants and landscaping.',
    phone: '9876543214',
    email: 'vikram@example.com',
    profilePhoto: null,
    reviews: []
  },
  {
    _id: '6',
    name: 'Anita Gupta',
    skills: ['Electrician', 'Plumber'],
    location: 'Hyderabad',
    rating: 4.7,
    reviewCount: 25,
    hourlyRate: 320,
    dailyRate: 2200,
    availability: 'available',
    bio: 'Multi-skilled professional with expertise in electrical and plumbing work.',
    phone: '9876543215',
    email: 'anita@example.com',
    profilePhoto: null,
    reviews: [
      { reviewerName: 'Suresh', rating: 5, comment: 'Excellent work quality', date: '2023-08-05' }
    ]
  }
];

const BrowseLaborers = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [laborers, setLaborers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLaborer, setSelectedLaborer] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [apiError, setApiError] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [ratingFilter, setRatingFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLaborers, setTotalLaborers] = useState(0);
  const itemsPerPage = 6;

  // Hire form state
  const [hireForm, setHireForm] = useState({
    jobTitle: '',
    description: '',
    budget: '',
    location: '',
    scheduledDate: '',
    message: ''
  });

  const skills = [
    'Plumber', 'Electrician', 'Mason', 'Carpenter', 
    'Painter', 'Welder', 'Gardener', 'Cleaner', 'Other (Please specify)'
  ];

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Other (Please specify)'
  ];

  const ratings = ['4+ Stars', '3+ Stars', '2+ Stars', '1+ Stars'];
  const availabilityOptions = ['available', 'busy', 'unavailable'];

  useEffect(() => {
    loadLaborers();
  }, [currentPage, searchTerm, selectedSkill, customSkill, selectedLocation, customLocation, priceRange, ratingFilter, availabilityFilter, sortOrder]);

  const loadLaborers = async () => {
    setLoading(true);
    setApiError(false);
    
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        skill: selectedSkill === 'Other' ? customSkill : selectedSkill,
        location: selectedLocation === 'Other' ? customLocation : selectedLocation,
        minPrice: priceRange.min || 0,
        maxPrice: priceRange.max || Number.MAX_SAFE_INTEGER,
        rating: ratingFilter ? parseInt(ratingFilter.charAt(0)) : 0,
        availability: availabilityFilter,
        sort: sortOrder
      });

      console.log('Making API request to:', `/laborers/browse?${params}`);
      
      const response = await axiosInstance.get(`/laborers/browse?${params}`);
      
      if (response.data && response.data.laborers) {
        setLaborers(response.data.laborers);
        setTotalLaborers(response.data.total || response.data.laborers.length);
        setTotalPages(Math.ceil((response.data.total || response.data.laborers.length) / itemsPerPage));
        console.log('✅ API Success:', response.data);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('❌ API Error:', error);
      setApiError(true);
      
      // Fallback to dummy data with client-side filtering
      const filteredDummy = applyClientSideFilters(dummyLaborers);
      setLaborers(filteredDummy);
      setTotalLaborers(filteredDummy.length);
      setTotalPages(Math.ceil(filteredDummy.length / itemsPerPage));
      
      showToast('Using demo data - API connection failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const applyClientSideFilters = (data) => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(laborer => 
        laborer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        laborer._id.includes(searchTerm)
      );
    }

    // Apply skill filter
    if (selectedSkill && selectedSkill !== 'Other') {
      filtered = filtered.filter(laborer => 
        laborer.skills.includes(selectedSkill)
      );
    } else if (selectedSkill === 'Other' && customSkill) {
      filtered = filtered.filter(laborer => 
        laborer.skills.some(skill => 
          skill.toLowerCase().includes(customSkill.toLowerCase())
        )
      );
    }

    // Apply location filter
    if (selectedLocation && selectedLocation !== 'Other') {
      filtered = filtered.filter(laborer => 
        laborer.location === selectedLocation
      );
    } else if (selectedLocation === 'Other' && customLocation) {
      filtered = filtered.filter(laborer => 
        laborer.location.toLowerCase().includes(customLocation.toLowerCase())
      );
    }

    // Apply price range filter
    if (priceRange.min || priceRange.max) {
      const minPrice = priceRange.min ? Number(priceRange.min) : 0;
      const maxPrice = priceRange.max ? Number(priceRange.max) : Infinity;
      filtered = filtered.filter(laborer => 
        laborer.dailyRate >= minPrice && laborer.dailyRate <= maxPrice
      );
    }

    // Apply rating filter
    if (ratingFilter) {
      const minRating = parseInt(ratingFilter.charAt(0));
      filtered = filtered.filter(laborer => 
        (laborer.rating || 0) >= minRating
      );
    }

    // Apply availability filter
    if (availabilityFilter) {
      filtered = filtered.filter(laborer => 
        laborer.availability === availabilityFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      return sortOrder === 'asc' ? aRating - bRating : bRating - aRating;
    });

    // Apply pagination for dummy data
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleHire = async (e) => {
    e.preventDefault();
    if (!selectedLaborer) return;

    if (!user) {
      showToast('Please login to hire laborers', 'warning');
      return;
    }

    try {
      await axiosInstance.post('/jobs/hire-laborer', {
        laborerId: selectedLaborer._id,
        ...hireForm
      });
      
      showToast('Job offer sent successfully!', 'success');
      setShowHireModal(false);
      resetHireForm();
    } catch (error) {
      console.error('Hire error:', error);
      showToast(error.response?.data?.message || 'Failed to send job offer', 'danger');
    }
  };

  const resetHireForm = () => {
    setHireForm({
      jobTitle: '',
      description: '',
      budget: '',
      location: '',
      scheduledDate: '',
      message: ''
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
    setCustomSkill('');
    setSelectedLocation('');
    setCustomLocation('');
    setPriceRange({ min: '', max: '' });
    setRatingFilter('');
    setAvailabilityFilter('');
    setCurrentPage(1);
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const numRating = rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= numRating ? 'text-warning' : 'text-muted'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getAvailabilityBadge = (availability) => {
    const variants = {
      'available': 'success',
      'busy': 'warning',
      'unavailable': 'danger'
    };
    const labels = {
      'available': 'Available',
      'busy': 'Busy',
      'unavailable': 'Unavailable'
    };
    return (
      <Badge bg={variants[availability] || 'secondary'}>
        {labels[availability] || availability}
      </Badge>
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container fluid className="py-4">
      {/* CORS Status Component (Development Only) */}
      <CorsStatus />
      
      {/* API Error Alert */}
      {apiError && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>⚠️ API Connection Issue</Alert.Heading>
          <p>Unable to connect to the backend API. Showing demo data instead.</p>
          <hr />
          <p className="mb-0">
            <strong>For developers:</strong> Ensure backend is running on port 8080 and CORS is properly configured.
          </p>
        </Alert>
      )}

      <Row>
        {/* Filters Sidebar */}
        <Col lg={3}>
          <Card className="sticky-top" style={{ top: '0' }}>
            <Card.Header>
              <h5 className="mb-0">🔍 Search & Filters</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                {/* Search */}
                <Form.Group className="mb-3">
                  <Form.Label>Search</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by name/laborer ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

                {/* Skill Filter */}
                <Form.Group className="mb-3">
                  <Form.Label>Skill</Form.Label>
                  <Form.Select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                  >
                    <option value="">All Skills</option>
                    {skills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </Form.Select>
                  {selectedSkill === 'Other' && (
                    <Form.Control
                      type="text"
                      placeholder="Enter custom skill"
                      className="mt-2"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                    />
                  )}
                </Form.Group>

                {/* Location Filter */}
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </Form.Select>
                  {selectedLocation === 'Other' && (
                    <Form.Control
                      type="text"
                      placeholder="Enter custom location"
                      className="mt-2"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                    />
                  )}
                </Form.Group>

                {/* Price Range */}
                <Form.Group className="mb-3">
                  <Form.Label>Price Range (₹/day)</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                      />
                    </Col>
                  </Row>
                </Form.Group>

                {/* Rating Filter */}
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Rating</Form.Label>
                  <Form.Select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                  >
                    <option value="">Any Rating</option>
                    {ratings.map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Availability Filter */}
                <Form.Group className="mb-3">
                  <Form.Label>Availability</Form.Label>
                  <Form.Select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                  >
                    <option value="">Any Status</option>
                    {availabilityOptions.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={clearFilters}
                  className="w-100"
                >
                  🗑️ Clear Filters
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Laborers Grid */}
        <Col lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>👷 Available Laborers</h4>
            <div className="d-flex align-items-center gap-3">
              <div className="text-muted">
                {loading ? 'Loading...' : `${totalLaborers} laborers found`}
              </div>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={`Sort by rating ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? '⬆️ Rating' : '⬇️ Rating'}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading laborers...</p>
            </div>
          ) : laborers.length > 0 ? (
            <>
              <Row>
                {laborers.map((laborer) => (
                  <Col key={laborer._id} lg={4} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm hover-lift">
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex align-items-center mb-3">
                          <img
                            src={laborer.profilePhoto || 'https://via.placeholder.com/60?text=👤'}
                            alt={laborer.name}
                            className="rounded-circle me-3"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/60?text=👤';
                            }}
                          />
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{laborer.name}</h6>
                            <div className="text-muted small">
                              {laborer.skills?.join(', ') || 'No skills listed'}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3 flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted">Rating:</span>
                            <div>
                              {getRatingStars(laborer.rating)}
                              <span className="ms-1 small">({laborer.reviewCount || 0})</span>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted">Rate:</span>
                            <span className="fw-bold">₹{laborer.hourlyRate || 0}/hr</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted">Daily:</span>
                            <span className="fw-bold">₹{laborer.dailyRate || 0}/day</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Location:</span>
                            <span>{laborer.location}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          {getAvailabilityBadge(laborer.availability)}
                        </div>

                        <div className="d-grid gap-2 mt-auto">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedLaborer(laborer);
                              setShowProfileModal(true);
                            }}
                          >
                            👁️ View Profile
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedLaborer(laborer);
                              setShowHireModal(true);
                            }}
                            disabled={laborer.availability === 'unavailable'}
                          >
                            💼 Hire Now
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <Pagination.Ellipsis key={pageNum} />;
                      }
                      return null;
                    })}
                    
                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <Alert variant="info" className="text-center py-5">
              <h5>No laborers found</h5>
              <p>Try adjusting your search criteria or clear filters to see more results.</p>
              <Button variant="outline-primary" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </Alert>
          )}
        </Col>
      </Row>

      {/* Enhanced Profile Modal */}
      <Modal 
        show={showProfileModal} 
        onHide={() => setShowProfileModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>👷 {selectedLaborer?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLaborer && (
            <div>
              <Row>
                <Col md={4} className="text-center">
                  <img
                    src={selectedLaborer.profilePhoto || 'https://via.placeholder.com/150?text=👤'}
                    alt={selectedLaborer.name}
                    className="rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=👤';
                    }}
                  />
                  <h5>{selectedLaborer.name}</h5>
                  <p className="text-muted">{selectedLaborer.skills?.join(', ')}</p>
                  {getAvailabilityBadge(selectedLaborer.availability)}
                </Col>
                <Col md={8}>
                  <h6>About</h6>
                  <p>{selectedLaborer.bio || 'No bio available.'}</p>
                  
                  <h6>Skills & Experience</h6>
                  <div className="mb-3">
                    {selectedLaborer.skills?.map(skill => (
                      <Badge key={skill} bg="primary" className="me-1 mb-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <h6>Contact Information</h6>
                  <p><strong>Phone:</strong> {selectedLaborer.phone || 'Not provided'}</p>
                  <p><strong>Email:</strong> {selectedLaborer.email || 'Not provided'}</p>
                  <p><strong>Location:</strong> {selectedLaborer.location}</p>
                  
                  <h6>Pricing</h6>
                  <p><strong>Hourly Rate:</strong> ₹{selectedLaborer.hourlyRate || 0}/hr</p>
                  <p><strong>Daily Rate:</strong> ₹{selectedLaborer.dailyRate || 0}/day</p>
                </Col>
              </Row>
              
              {/* Reviews Section */}
              <hr />
              <h6>Reviews & Ratings</h6>
              <div className="d-flex align-items-center mb-2">
                <div className="me-2">
                  {getRatingStars(selectedLaborer.rating || 0)}
                </div>
                <span className="fw-bold">{selectedLaborer.rating || 0}/5</span>
                <span className="text-muted ms-2">({selectedLaborer.reviewCount || 0} reviews)</span>
              </div>
              
              {selectedLaborer.reviews && selectedLaborer.reviews.length > 0 ? (
                <div>
                  {selectedLaborer.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="border-start border-2 border-primary ps-3 mb-3">
                      <div className="d-flex justify-content-between">
                        <strong>{review.reviewerName}</strong>
                        <div>{getRatingStars(review.rating)}</div>
                      </div>
                      <p className="mb-1">{review.comment}</p>
                      <small className="text-muted">{new Date(review.date).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No reviews yet.</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              setShowProfileModal(false);
              setShowHireModal(true);
            }}
            disabled={selectedLaborer?.availability === 'unavailable'}
          >
            💼 Hire This Laborer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Enhanced Hire Modal */}
      <Modal show={showHireModal} onHide={() => setShowHireModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>💼 Hire {selectedLaborer?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleHire}>
          <Modal.Body>
            {!user && (
              <Alert variant="warning">
                <strong>Login Required:</strong> You need to be logged in to hire laborers.
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Job Title *</Form.Label>
              <Form.Control
                type="text"
                value={hireForm.jobTitle}
                onChange={(e) => setHireForm({...hireForm, jobTitle: e.target.value})}
                required
                placeholder="e.g., Plumbing repair work"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Job Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                value={hireForm.description}
                onChange={(e) => setHireForm({...hireForm, description: e.target.value})}
                required
                placeholder="Describe the work that needs to be done..."
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Budget (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={hireForm.budget}
                    onChange={(e) => setHireForm({...hireForm, budget: e.target.value})}
                    required
                    placeholder="Enter your budget"
                  />
                  <Form.Text className="text-muted">
                    Suggested: ₹{selectedLaborer?.dailyRate || 0}/day
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    value={hireForm.location}
                    onChange={(e) => setHireForm({...hireForm, location: e.target.value})}
                    required
                    placeholder="Work location"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Scheduled Date</Form.Label>
              <Form.Control
                type="date"
                value={hireForm.scheduledDate}
                onChange={(e) => setHireForm({...hireForm, scheduledDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Message to Laborer</Form.Label>
              <Form.Control
                as="textarea"
                rows="2"
                value={hireForm.message}
                onChange={(e) => setHireForm({...hireForm, message: e.target.value})}
                placeholder="Any specific requirements or details..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowHireModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={!user}
            >
              Send Job Offer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
      `}</style>
      </Container>
  );
};

export default BrowseLaborers;
