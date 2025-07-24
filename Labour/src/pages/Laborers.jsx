import React from 'react';
import { useParams } from 'react-router-dom';
import LaborerProfile from '../Components/LaborerProfile';

// Fake laborers data (same as in HomePage.jsx)
const fakeLaborers = [
  {
    _id: '1',
    name: 'Ramesh Kumar',
    specialization: 'Electrician',
    location: 'Jaipur, Rajasthan',
    rating: 4.6,
    reviews: 32,
    description: 'Experienced electrician with 7+ years of residential and commercial wiring work.',
    isAvailable: true,
    gallery: [
      '/images/work1.jpg',
      '/images/work2.jpg',
      '/images/work3.jpg',
    ],
    social: {
      facebook: 'https://facebook.com/rameshwork',
      instagram: 'https://instagram.com/rameshwork',
    },
    contact: {
      phone: '+91 9876543210',
      whatsapp: '919876543210',
    },
  },
  {
    _id: '2',
    name: 'Sita Devi',
    specialization: 'Plumber',
    location: 'Delhi, India',
    rating: 4.6,
    reviews: 20,
    description: 'Skilled plumber with 5+ years of experience in residential plumbing.',
    isAvailable: false,
    gallery: [
      '/images/plumber1.jpg',
      '/images/plumber2.jpg',
    ],
    social: {
      facebook: 'https://facebook.com/sitadevi',
      instagram: 'https://instagram.com/sitadevi',
    },
    contact: {
      phone: '+91 9123456789',
      whatsapp: '919123456789',
    },
  },
  {
    _id: '3',
    name: 'Rahul Singh',
    specialization: 'Mason',
    location: 'Mumbai, Maharashtra',
    rating: 4.7,
    reviews: 15,
    description: 'Expert mason with 10+ years of experience in construction.',
    isAvailable: true,
    gallery: [
      '/images/mason1.jpg',
      '/images/mason2.jpg',
    ],
    social: {
      facebook: 'https://facebook.com/rahulsingh',
      instagram: 'https://instagram.com/rahulsingh',
    },
    contact: {
      phone: '+91 9988776655',
      whatsapp: '919988776655',
    },
  },
];

const Laborers = () => {
  const { id } = useParams();
  const laborer = fakeLaborers.find(lab => lab._id === id);

  return <LaborerProfile laborer={laborer} />;
};

export default Laborers;
