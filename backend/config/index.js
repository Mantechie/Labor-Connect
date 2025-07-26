// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

export default {
  // Server configuration
  server: {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api'
  },
  
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-connect',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // JWT configuration
  jwt: {
    accessSecret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret-key',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'labour-connect'
  },
  
  // Security configuration
  security: {
    bcryptRounds: process.env.NODE_ENV === 'production' ? 12 : 10,
    otpExpiry: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10) * 60 * 1000,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    passwordHistory: parseInt(process.env.PASSWORD_HISTORY || '5', 10),
    cookieSecure: process.env.NODE_ENV === 'production',
    cookieSameSite: 'strict'
  },
  
  // Rate limiting
  rateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10),
    otpMax: parseInt(process.env.OTP_RATE_LIMIT_MAX || '3', 10)
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
    from: process.env.EMAIL_FROM || 'noreply@labourconnect.com',
    retryAttempts: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3', 10) 
  },
  
  // SMS configuration
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBERprovider || process.env.SMS_PROVIDER || 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    retryAttempts: parseInt(process.env.SMS_RETRY_ATTEMPTS || '3', 10)
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    maxSize: process.env.LOG_MAX_SIZE || '20m'
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  // Admin settings
  admin: {
    defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@labourconnect.com',
    defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
  }
};
