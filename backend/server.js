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
import path from 'path'
import { fileURLToPath } from 'url'
import reportRoutes from './routes/reportRoutes.js';
import jobApplicationRoutes from './routes/jobApplicationRoutes.js';


// Connect to MongoDB
connectDB()

const app = express()
const server = createServer(app)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Socket.IO
initializeSocket(server)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Middleware
app.use(express.json()) // For JSON body parsing
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Use different logging based on environment
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Serve static files
app.use('/uploads', express.static('uploads'))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/laborers', laborerRoutes);
app.use('/api/jobs', jobRoutes);

// IMPORTANT: Mount admin auth routes BEFORE admin routes
// This prevents the admin middleware from being applied to auth routes
app.use('/api/admin/auth', adminAuthRoutes);

app.use('/api/admin', (req, res, next) => {
  console.log('🔍 Admin Route:', req.method, req.originalUrl);
  next();
}, adminRoutes);

app.use('/api/admin/users', (req, res, next) => {
  console.log('🔍 User Management Route:', req.method, req.originalUrl);
  next();
}, userManagementRoutes);

app.use('/api/laborers/management', (req, res, next) => {
  console.log('🔍 Laborer Management Route:', req.method, req.originalUrl);
  next();
}, laborerManagementRoutes);

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
