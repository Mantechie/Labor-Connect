import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../Components/ToastContext';
import axiosInstance from '../utils/axiosInstance';
import { 
  Card, 
  Row, 
  Col, 
  Form, 
  Button, 
  Badge, 
  Modal, 
  InputGroup,
  Dropdown,
  Pagination,
  Alert,
  Spinner
} from 'react-bootstrap';

const BrowseLaborers = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [laborers, setLaborers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLaborer, setSelectedLaborer] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [ratingFilter, setRatingFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);

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
    'Painter', 'Welder', 'Gardener', 'Cleaner', 'Other'
  ];

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Other'
  ];

  const ratings = ['4+ Stars', '3+ Stars', '2+ Stars', 'Any Rating'];

  const availabilityOptions = ['Available Now', 'Available This Week', 'Available Next Week', 'Any Time'];

  useEffect(() => {
    loadLaborers();
  }, [currentPage, searchTerm, selectedSkill, selectedLocation, priceRange, ratingFilter, availabilityFilter]);

  const loadLaborers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        skill: selectedSkill,
        location: selectedLocation,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        rating: ratingFilter,
        availability: availabilityFilter
      });

      const response = await axiosInstance.get(`/laborers/browse?${params}`);
      setLaborers(response.data.laborers || []);
      setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
    } catch (error) {
      console.error('Failed to load laborers:', error);
      showToast('Failed to load laborers', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleHire = async (e) => {
    e.preventDefault();
    if (!selectedLaborer) return;

    try {
      const response = await axiosInstance.post('/jobs/hire-laborer', {
        laborerId: selectedLaborer._id,
        ...hireForm
      });
      
      showToast('Job offer sent successfully!', 'success');
      setShowHireModal(false);
      setHireForm({
        jobTitle: '',
        description: '',
        budget: '',
        location: '',
        scheduledDate: '',
        message: ''
      });
    } catch (error) {
      showToast(error.message || 'Failed to send job offer', 'danger');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
    setSelectedLocation('');
    setPriceRange({ min: '', max: '' });
    setRatingFilter('');
    setAvailabilityFilter('');
    setCurrentPage(1);
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

  const getAvailabilityBadge = (availability) => {
    const variants = {
      'available': 'success',
      'busy': 'warning',
      'unavailable': 'danger'
    };
    return <Badge bg={variants[availability] || 'secondary'}>{availability}</Badge>;
  };

  return (
    <div className="container py-4">
      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-lg-3">
          <Card className="sticky-top" style={{ top: '20px' }}>
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
                      placeholder="Search by name, skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary">
                      <i className="bi bi-search"></i>
                    </Button>
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
                </Form.Group>

                {/* Price Range */}
                <Form.Group className="mb-3">
                  <Form.Label>Price Range (₹/day)</Form.Label>
                  <div className="row">
                    <div className="col-6">
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                      />
                    </div>
                    <div className="col-6">
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                      />
                    </div>
                  </div>
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
                    <option value="">Any Time</option>
                    {availabilityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
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
        </div>

        {/* Laborers Grid */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>👷 Available Laborers</h4>
            <div className="text-muted">
              {loading ? 'Loading...' : `${laborers.length} laborers found`}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : laborers.length > 0 ? (
            <>
              <Row>
                {laborers.map((laborer) => (
                  <Col key={laborer._id} lg={4} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm hover-lift">
                      <Card.Body>
                        <div className="d-flex align-items-center mb-3">
                          <img
                            src={laborer.profilePhoto || 'https://via.placeholder.com/60?text=Profile'}
                            alt={laborer.name}
                            className="rounded-circle me-3"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-1">{laborer.name}</h6>
                            <div className="text-muted small">{laborer.skills?.join(', ')}</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted">Rating:</span>
                            <div>
                              {getRatingStars(laborer.rating || 0)}
                              <span className="ms-1 small">({laborer.reviewCount || 0})</span>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted">Rate:</span>
                            <span className="fw-bold">₹{laborer.hourlyRate || 0}/hr</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Location:</span>
                            <span>{laborer.location}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          {getAvailabilityBadge(laborer.availability)}
                        </div>

                        <div className="d-grid gap-2">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No laborers found matching your criteria. Try adjusting your filters.
            </Alert>
          )}
        </div>
      </div>

      {/* Laborer Profile Modal */}
      <Modal 
        show={showProfileModal} 
        onHide={() => setShowProfileModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>👷 {selectedLaborer?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLaborer && (
            <div>
              <div className="row">
                <div className="col-md-4 text-center">
                  <img
                    src={selectedLaborer.profilePhoto || 'https://via.placeholder.com/150?text=Profile'}
                    alt={selectedLaborer.name}
                    className="rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                  <h5>{selectedLaborer.name}</h5>
                  <p className="text-muted">{selectedLaborer.skills?.join(', ')}</p>
                  {getAvailabilityBadge(selectedLaborer.availability)}
                </div>
                <div className="col-md-8">
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
                </div>
              </div>
              
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
              
              {/* Sample Reviews */}
              <div className="small">
                {selectedLaborer.reviews?.slice(0, 3).map((review, index) => (
                  <div key={index} className="border-start border-2 border-primary ps-3 mb-2">
                    <div className="d-flex justify-content-between">
                      <strong>{review.reviewerName}</strong>
                      <div>{getRatingStars(review.rating)}</div>
                    </div>
                    <p className="mb-1">{review.comment}</p>
                    <small className="text-muted">{new Date(review.date).toLocaleDateString()}</small>
                  </div>
                )) || <p className="text-muted">No reviews yet.</p>}
              </div>
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
          >
            💼 Hire This Laborer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Hire Modal */}
      <Modal show={showHireModal} onHide={() => setShowHireModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>💼 Hire {selectedLaborer?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleHire}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Job Title *</Form.Label>
              <Form.Control
                type="text"
                value={hireForm.jobTitle}
                onChange={(e) => setHireForm({...hireForm, jobTitle: e.target.value})}
                required
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
              />
            </Form.Group>
            
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Budget (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={hireForm.budget}
                    onChange={(e) => setHireForm({...hireForm, budget: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    value={hireForm.location}
                    onChange={(e) => setHireForm({...hireForm, location: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Scheduled Date</Form.Label>
              <Form.Control
                type="date"
                value={hireForm.scheduledDate}
                onChange={(e) => setHireForm({...hireForm, scheduledDate: e.target.value})}
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
            <Button type="submit" variant="primary">
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
    </div>
  );
};

export default BrowseLaborers; 