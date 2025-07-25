import winston from 'winston';
import 'winston-daily-rotate-file';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'http';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define format for file output (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
  
  // Rotate file for all logs
  new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
  }),
  
  // Separate file for error logs
  new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: fileFormat,
  }),
  
  // Separate file for auth logs
  new winston.transports.DailyRotateFile({
    filename: 'logs/auth-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: fileFormat,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

// Auth-specific logger functions
const authLogger = {
  login: (userId, email, success, ip, userAgent, details = {}) => {
    logger.info(`AUTH_LOGIN | User: ${email} (${userId}) | Success: ${success}`, {
      event: 'login',
      userId,
      email,
      success,
      ip,
      userAgent,
      ...details
    });
  },
  
  register: (userId, email, success, ip, userAgent, details = {}) => {
    logger.info(`AUTH_REGISTER | User: ${email} (${userId}) | Success: ${success}`, {
      event: 'register',
      userId,
      email,
      success,
      ip,
      userAgent,
      ...details
    });
  },
  
  logout: (userId, email, ip, userAgent, details = {}) => {
    logger.info(`AUTH_LOGOUT | User: ${email} (${userId})`, {
      event: 'logout',
      userId,
      email,
      ip,
      userAgent,
      ...details
    });
  },
  
  tokenRefresh: (userId, email, success, ip, userAgent, details = {}) => {
    logger.info(`AUTH_TOKEN_REFRESH | User: ${email} (${userId}) | Success: ${success}`, {
      event: 'token_refresh',
      userId,
      email,
      success,
      ip,
      userAgent,
      ...details
    });
  },
  
  otpRequest: (userId, email, phone, success, ip, userAgent, details = {}) => {
    logger.info(`AUTH_OTP_REQUEST | User: ${email || phone} (${userId}) | Success: ${success}`, {
      event: 'otp_request',
      userId,
      email,
      phone,
      success,
      ip,
      userAgent,
      ...details
    });
  },
  
  otpVerify: (userId, email, phone, success, ip, userAgent, details = {}) => {
    logger.info(`AUTH_OTP_VERIFY | User: ${email || phone} (${userId}) | Success: ${success}`, {
      event: 'otp_verify',
      userId,
      email,
      phone,
      success,
      ip,
      userAgent,
      ...details
    });
  },
  
  passwordChange: (userId, email, success, ip, userAgent, details = {}) => {
    logger.info(`AUTH_PASSWORD_CHANGE | User: ${email} (${userId}) | Success: ${success}`, {
      event: 'password_change',
      userId,
      email,
      success,
      ip,
      userAgent,
      ...details
    });
  },
  
  securityEvent: (userId, email, eventType, ip, userAgent, details = {}) => {
    logger.warn(`AUTH_SECURITY_EVENT | User: ${email} (${userId}) | Event: ${eventType}`, {
      event: 'security_event',
      userId,
      email,
      eventType,
      ip,
      userAgent,
      ...details
    });
  }
};

export { logger, authLogger };
