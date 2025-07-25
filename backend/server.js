import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { createServer } from 'http'
import connectDB from './config/db.js'
import config from './config/env.js'
import { initializeSocket } from './sockets/chatSocket.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import laborerRoutes from './routes/laborerRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import adminAuthRoutes from './routes/adminAuthRoutes.js'
import userManagementRoutes from './routes/userManagementRoutes.js'
import laborerManagementRoutes from './routes/laborerManagementRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js'
import { corsDebugMiddleware, credentialsMiddleware, preflightHandler, validateCorsOrigin, corsErrorHandler, dynamicCorsOrigin } from './middlewares/corsMiddleware.js'
import path from 'path'
import { fileURLToPath } from 'url'
import reportRoutes from './routes/reportRoutes.js';
import jobApplicationRoutes from './routes/jobApplicationRoutes.js';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { validateEnv } from './utils/validateEnv.js';
import { apiLimiter, authLimiter, otpLimiter } from './middlewares/ratelimiter.js';
import { registerValidation, loginValidation, otpValidation } from './middlewares/validationMiddleware.js';
import healthRoutes from './routes/healthRoutes.js';
import cookieParser from 'cookie-parser';
import './jobs/cleanupChats.js';

// Connect to MongoDB
connectDB()
validateEnv()

const app = express()
const server = createServer(app)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Socket.IO
initializeSocket(server)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Trust proxy for production deployments
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '10mb' })); // For JSON body parsing with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For form data

// CORS Debug Middleware (development only)
if (config.NODE_ENV === 'development') {
  app.use(corsDebugMiddleware);
}

// Use credentials middleware to set security headers
app.use(credentialsMiddleware);

// Handle preflight OPTIONS requests BEFORE main CORS middleware
app.use(preflightHandler);

// Dynamic CORS origin setter
app.use(dynamicCorsOrigin);

// Main CORS Configuration with enhanced validation
app.use(cors({
  origin: (origin, callback) => {
    if (config.NODE_ENV === 'development') {
      console.log(`🔍 CORS Check: Origin "${origin}" being validated...`);
    }
    
    if (validateCorsOrigin(origin)) {
      callback(null, true);
    } else {
      const error = new Error(`CORS policy violation: Origin "${origin}" is not allowed`);
      error.status = 403;
      callback(error);
    }
  },
  credentials: config.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override',
    'X-Forwarded-For',
    'X-Real-IP',
    'User-Agent',
    'Referer',
    'Accept-Language',
    'Accept-Encoding'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'Content-Length'
  ],
  maxAge: config.CORS_MAX_AGE,
  optionsSuccessStatus: 204 // Some legacy browsers choke on 204
}));

app.use(cookieParser());

// Additional CORS and security middleware
app.use(credentialsMiddleware);
app.use(preflightHandler);

// Apply Helmet middleware for security headers
app.use(helmet());

// Configure Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://secure.gravatar.com'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  })
);

// Use different logging based on environment
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Add HSTS header in production
if (process.env.NODE_ENV === 'production') {
  app.use(
    helmet.hsts({
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    })
  );
}

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Serve static files
app.use('/uploads', express.static('uploads'))

// Global error handler - must be after all routes
app.use(errorHandler);

app.use('/api', healthRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  const origin = req.get('Origin');
  res.json({
    message: 'CORS test successful',
    origin: origin || 'no-origin',
    timestamp: new Date().toISOString(),
    corsConfig: {
      allowedOrigins: config.CORS_ORIGIN.split(',').map(o => o.trim()),
      credentials: config.CORS_CREDENTIALS,
      environment: config.NODE_ENV
    }
  });
});

// CORS preflight test endpoint
app.options('/api/cors-test', (req, res) => {
  const origin = req.get('Origin');
  console.log(`🧪 CORS Test Preflight from: ${origin}`);
  res.status(204).end();
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/send-otp', otpLimiter);
app.use(apiLimiter);

// API Routes - Mount more specific routes BEFORE general ones
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// IMPORTANT: Mount admin auth routes BEFORE admin routes
// This prevents the admin middleware from being applied to auth routes
app.use('/api/admin/auth', adminAuthRoutes);

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Mount more specific admin routes BEFORE general admin routes
app.use('/api/admin/users', (req, res, next) => {
  console.log('🔍 User Management Route:', req.method, req.originalUrl);
  next();
}, userManagementRoutes);

// Mount more specific laborer routes BEFORE general laborer routes
app.use('/api/laborers/management', (req, res, next) => {
  console.log('🔍 Laborer Management Route:', req.method, req.originalUrl);
  next();
}, laborerManagementRoutes);

app.use('/api/laborers', laborerRoutes);
app.use('/api/jobs', jobRoutes);

// Mount general admin routes AFTER specific admin routes
app.use('/api/admin', (req, res, next) => {
  console.log('🔍 Admin Route:', req.method, req.originalUrl);
  next();
}, adminRoutes);

app.use('/api/reviews', reviewRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/support', reportRoutes);
app.use('/api/applications', jobApplicationRoutes);

console.log('✅ All API routes mounted successfully');

// Health Check
app.get('/', (req, res) => {
  res.render('home',{
    title: 'Labour Connect',
    categories: [
      { title: 'Electrician', img: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png' },
      { title: 'Plumber', img: 'https://cdn-icons-png.flaticon.com/512/2965/2965564.png' },
      { title: 'Mason', img: 'https://cdn-icons-png.flaticon.com/512/2965/2965556.png' },
      { title: 'Carpenter', img: 'https://cdn-icons-png.flaticon.com/512/2965/2965561.png' }
    ],
    laborers: [
      { name: 'Ramesh', specialization: 'Electrician', rating: 4.8 },
      { name: 'Sita', specialization: 'Plumber', rating: 4.6 },
      { name: 'Rahul', specialization: 'Mason', rating: 4.7 }
    ]      
  })
})
app.get('/users', (req, res) =>{
  res.render('users')
})
app.get('/admin', (req, res) =>{
  res.render('admin')
})
app.get('/reviews', (req, res) =>{ 
  res.render('reviews')
})
app.get('/chats', (req, res) =>{
  res.render('chats')
})

// Catch-all for 404
app.use((req, res) => {
  res.status(404).render('404')
})

// Error Middlewares
app.use(corsErrorHandler) // Handle CORS errors first
app.use(notFound)
app.use(errorHandler)

// Server Start
const PORT = process.env.PORT
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`)
  console.log(`📧 Email configured: ${config.EMAIL_USER ? 'Yes' : 'No'}`)
  console.log(`📱 SMS configured: ${config.TWILIO_ACCOUNT_SID ? 'Yes' : 'No'}`)
  console.log(`🔌 WebSocket enabled for real-time chat`)
})
