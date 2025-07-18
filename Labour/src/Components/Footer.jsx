// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white text-center py-3 mt-auto">
      <div className="container">
        <p className="mb-1">&copy; {new Date().getFullYear()} LabourConnect. All rights reserved.</p>
        <small>Connecting skilled laborers to your doorstep with trust and ease.</small>
      </div>
    </footer>
  );
};

export default Footer;
