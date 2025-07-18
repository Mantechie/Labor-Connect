// src/index.jsx
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/App.css';
import './styles/components.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap added globally

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
