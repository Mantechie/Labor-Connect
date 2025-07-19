import React, { useState, useRef } from 'react';
import { Button, ProgressBar, Modal } from 'react-bootstrap';
import { useToast } from '../Components/ToastContext';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoUpdate, loading, setLoading }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(currentPhoto || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const validateAndSetPhoto = (file) => {
    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'danger');
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'danger');
      return;
    }

    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
    setShowPreviewModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetPhoto(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetPhoto(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!profilePhoto) return;

    try {
      setLoading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Call the parent's upload function
      await onPhotoUpdate(profilePhoto);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setShowPreviewModal(false);
      setProfilePhoto(null);
      showToast('Profile photo updated successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update profile photo', 'danger');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <div className="text-center mb-4">
        {/* Profile Photo Container */}
        <div
          className={`profile-photo-container ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '120px',
            height: '120px',
            margin: '0 auto',
            borderRadius: '50%',
            border: '3px solid #e9ecef',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: isDragOver ? '#f8f9fa' : 'transparent',
            position: 'relative'
          }}
        >
          <img
            src={photoPreview || 'https://via.placeholder.com/120?text=Profile'}
            alt="Profile"
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
          />
          
          {/* Upload Overlay */}
          <div 
            className="upload-overlay" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              borderRadius: '50%'
            }}
          >
            <div className="text-white text-center">
              <i className="bi bi-camera fs-4"></i>
              <div className="small mt-1">Click or drag to upload</div>
            </div>
          </div>
        </div>
        
        {/* Camera Icon */}
        <div 
          className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle shadow-sm camera-icon" 
          style={{ 
            width: '32px', 
            height: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            transform: 'translate(25%, 25%)',
            position: 'absolute',
            bottom: '10px',
            right: '10px'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <i className="bi bi-camera" style={{ fontSize: '14px' }}></i>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-3 upload-progress">
            <ProgressBar 
              now={uploadProgress} 
              label={`${uploadProgress}%`}
              variant="primary"
              size="sm"
            />
          </div>
        )}
        
        {/* Upload Button */}
        {profilePhoto && (
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={handleUpload}
            disabled={loading}
            className="mt-3 w-100 upload-button"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Uploading...
              </>
            ) : (
              <>
                <i className="bi bi-upload me-2"></i>
                Upload Photo
              </>
            )}
          </Button>
        )}
        
        {/* Upload Instructions */}
        <div className="mt-2">
          <small className="text-muted">
            Click to upload or drag & drop
          </small>
          <br />
          <small className="text-muted">
            Max size: 5MB • Formats: JPG, PNG, GIF
          </small>
        </div>
      </div>

      {/* Photo Preview Modal */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>📸 Preview Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={photoPreview}
            alt="Preview"
            className="img-fluid rounded"
            style={{ maxHeight: '300px' }}
          />
          <p className="mt-3 text-muted">
            {profilePhoto?.name} ({(profilePhoto?.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .profile-photo-container {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .profile-photo-container:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .profile-photo-container:hover .upload-overlay {
          opacity: 1 !important;
        }
        
        .drag-over {
          border-color: #007bff !important;
          background-color: #f8f9fa !important;
          transform: scale(1.05);
          box-shadow: 0 12px 35px rgba(0,123,255,0.3);
        }
        
        .upload-overlay {
          backdrop-filter: blur(2px);
        }
        
        .camera-icon {
          transition: all 0.3s ease;
        }
        
        .camera-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .upload-progress {
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .upload-button {
          animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default ProfilePhotoUpload; 