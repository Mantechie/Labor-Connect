// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

export default {
  // Server configuration
  server: {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development'
  },
  
  // Database configuration
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/labour-connect'
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT) || 10,
    maxLimit: parseInt(process.env.MAX_PAGE_LIMIT) || 100
  },
  
  // Email configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@labourconnect.com'
  },
  
  // SMS configuration
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  
  // Admin settings
  admin: {
    defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@labourconnect.com',
    defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
  }
};
