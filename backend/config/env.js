import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Environment configuration with defaults
const config = {
  // Server Configuration
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yourDB',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'labor-connect-default-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@laborconnect.com',
  
  // Twilio Configuration (SMS)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  
  // File Upload Configuration
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5242880, // 5MB
  
  // CORS Configuration - supports multiple origins separated by commas
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,http://localhost:5174,https://example.com',
  
  // Redis Configuration (for sessions/caching)
  REDIS_URL: process.env.REDIS_URL || '',
  
  // Payment Configuration (for future use)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
}

// Validate required environment variables
const validateConfig = () => {
  const required = ['JWT_SECRET']
  const missing = required.filter(key => !config[key])
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing required environment variables: ${missing.join(', ')}`)
    console.warn('Using default values for development. Set these in production.')
  }
  
  return config
}

export default validateConfig() 