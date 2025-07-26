/**
 * Environment variables configuration for email service and other settings.
 * Please set the following environment variables in your deployment environment:
 * 
 * EMAIL_SERVICE: Gmail
 * EMAIL_USER: your-gmail-email@example.com
 * EMAIL_PASS: your-gmail-app-password
 * EMAIL_FROM: "Your App Name <your-gmail-email@example.com>"
 * 
 * Note: For Gmail, it is recommended to use an App Password instead of your main password.
 */

import dotenv from 'dotenv';
dotenv.config();

// Create a config object to hold all environment variables
const config = {

  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/labor-connect',

  // Email Configuration
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@laborconnect.com',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'devjwtsecret',
  
  // Twilio Configuration (SMS)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  
  // File Upload Configuration
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5242880, // 5MB
  
  // CORS Configuration - supports multiple origins separated by commas
  // In production, add your deployed frontend URL to CORS_ORIGIN environment variable
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:3000,http://127.0.0.1:5174',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true' || true,
  CORS_MAX_AGE: process.env.CORS_MAX_AGE || 86400,
  
  // Redis Configuration (for sessions/caching)
  REDIS_URL: process.env.REDIS_URL || '',
  
  // Payment Configuration (for future use)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
};

// Check for missing email configuration
if (!config.EMAIL_USER || !config.EMAIL_PASS || !config.EMAIL_FROM) {
  console.warn('Warning: Email environment variables are not fully set. Email sending may fail.');
}

// Validate required environment variables
const validateConfig = () => {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing required environment variables: ${missing.join(', ')}`);
    console.warn('Using default values for development. Set these in production.');
  }
  
  return config;
};

// Export individual config values for backward compatibility
export const {
  EMAIL_SERVICE,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  MONGO_URI,
  JWT_SECRET,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  UPLOAD_PATH,
  MAX_FILE_SIZE,
  CORS_ORIGIN,
  CORS_CREDENTIALS,
  CORS_MAX_AGE,
  REDIS_URL,
  STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY
} = config;

export default validateConfig();
