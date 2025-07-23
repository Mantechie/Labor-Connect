import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { Container, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';

const dummyReviews = [
  {
    reviewerName: 'John Doe',
    rating: 5,
    comment: 'Excellent work, very professional!',
    date: '2025-07-20T10:30:00Z',
  },
  {
    reviewerName: 'Jane Smith',
    rating: 4,
    comment: 'Good job, would hire again.',
    date: '2025-07-18T14:15:00Z',
  },
  {
    reviewerName: 'Bob Johnson',
    rating: 3,
    comment: 'Satisfactory work but could improve communication.',
    date: '2025-07-15T09:00:00Z',
  },
];

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return `Reviewed on ${date.toLocaleDateString(undefined, options)}`;
};

const getRatingStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? 'text-warning' : 'text-muted'}>
        &#9733;
      </span>
    );
  }
  return stars;
};

const LaborerRatings = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user || !user._id) {
        setError(true);
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(`/reviews/${user._id}`);
        if (response.data && response.data.length > 0) {
          setReviews(response.data);
        } else {
          setReviews([]);
        }
      } catch {
        setError(false);
        setReviews(dummyReviews);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  return (
    <Container className="py-4">
      <h3 className="mb-4">Ratings & Reviews</h3>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : error && reviews.length === 0 ? (
        <Alert variant="warning">Failed to load reviews and no fallback data available.</Alert>
      ) : reviews.length === 0 ? (
        <Alert variant="info">No reviews available.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {reviews.map((review, index) => {
            const reviewerName = review.reviewerName || (review.user && review.user.name) || 'Anonymous';
            const rating = review.rating || 0;
            const comment = review.comment || '';
            const date = review.createdAt || review.date || new Date().toISOString();

            return (
              <Col key={index}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>{reviewerName}</Card.Title>
                    <div className="mb-2">{getRatingStars(rating)}</div>
                    <Card.Text>{comment}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <small className="text-muted">{formatDate(date)}</small>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default LaborerRatings;
