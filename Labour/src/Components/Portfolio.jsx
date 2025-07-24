import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';

const Portfolio = () => {
  const { user } = useAuth(); // ✅ FIXED: Destructure user from context
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    fetch(`/api/portfolio/${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch portfolio');
        return res.json();
      })
      .then(data => {
        setPortfolioItems(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Portfolio</h2>
      {portfolioItems.length === 0 ? (
        <p>No portfolio items found. Start adding your work!</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {portfolioItems.map(item => (
            <Col key={item.id}>
              <Card>
                {item.imageUrl && (
                  <Card.Img variant="top" src={item.imageUrl} alt={item.title} />
                )}
                <Card.Body>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                  {item.date && (
                    <small className="text-muted">
                      Completed on: {new Date(item.date).toLocaleDateString()}
                    </small>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Portfolio;
