// src/components/Complaints.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Table, Spinner, Alert, Badge } from 'react-bootstrap';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'laborer') {
      setError('Access denied. Only laborers can view complaints.');
      setLoading(false);
      return;
    }

    fetch(`/api/complaints/laborer/${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch complaints');
        return res.json();
      })
      .then(data => {
        // Sort complaints by date descending
        const sortedData = data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setComplaints(sortedData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  const renderStatusBadge = (status) => {
    let variant;
    switch (status.toLowerCase()) {
      case 'resolved':
        variant = 'success';
        break;
      case 'pending':
        variant = 'warning';
        break;
      case 'rejected':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge bg={variant} className="text-capitalize">{status}</Badge>;
  };

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
      <h2 className="mb-4">Complaints</h2>
      {complaints.length === 0 ? (
        <p className="text-muted">No complaints found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>User</th>
              <th>Complaint</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(({ id, userName, message, date, status }) => (
              <tr key={id}>
                <td>{userName}</td>
                <td>{message}</td>
                <td>{date ? new Date(date).toLocaleDateString() : 'N/A'}</td>
                <td>{renderStatusBadge(status)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Complaints;
