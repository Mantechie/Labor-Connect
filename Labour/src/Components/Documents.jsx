// src/components/Documents.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';

const Documents = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) {
      setFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selected.type)) {
      setError('Only PDF, JPEG, and PNG files are allowed.');
      setFile(null);
      return;
    }

    // Validate file size (< 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selected.size > maxSize) {
      setError('File size must be under 5MB.');
      setFile(null);
      return;
    }

    setFile(selected);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== 'laborer') {
      setError('Access denied. Only laborers can upload documents.');
      return;
    }

    if (!file) {
      setError('Please select a valid file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await fetch(`/api/documents/upload/${user.id}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setSuccess('Document uploaded successfully!');
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Upload Documents</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label htmlFor="formFile">Select a document to upload</Form.Label>
          <Form.Control type="file" id="formFile" onChange={handleFileChange} />
          {file && (
            <div className="mt-2">
              <strong>Selected file:</strong> {file.name}
            </div>
          )}
        </Form.Group>

        <Button type="submit" disabled={uploading || !file}>
          {uploading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default Documents;
