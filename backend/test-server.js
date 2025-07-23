import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import config from './config/env.js'

// Connect to MongoDB
connectDB()

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test each route import one by one
console.log('Testing route imports...')

try {
  console.log('1. Testing authRoutes...')
  const authRoutes = await import('./routes/authRoutes.js')
  app.use('/api/auth', authRoutes.default)
  console.log('✅ authRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading authRoutes:', error.message)
}

try {
  console.log('2. Testing userRoutes...')
  const userRoutes = await import('./routes/userRoutes.js')
  app.use('/api/users', userRoutes.default)
  console.log('✅ userRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading userRoutes:', error.message)
}

try {
  console.log('3. Testing laborerRoutes...')
  const laborerRoutes = await import('./routes/laborerRoutes.js')
  app.use('/api/laborers', laborerRoutes.default)
  console.log('✅ laborerRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading laborerRoutes:', error.message)
}

try {
  console.log('4. Testing jobRoutes...')
  const jobRoutes = await import('./routes/jobRoutes.js')
  app.use('/api/jobs', jobRoutes.default)
  console.log('✅ jobRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading jobRoutes:', error.message)
}

try {
  console.log('5. Testing adminAuthRoutes...')
  const adminAuthRoutes = await import('./routes/adminAuthRoutes.js')
  app.use('/api/admin/auth', adminAuthRoutes.default)
  console.log('✅ adminAuthRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading adminAuthRoutes:', error.message)
}

try {
  console.log('6. Testing adminRoutes...')
  const adminRoutes = await import('./routes/adminRoutes.js')
  app.use('/api/admin', adminRoutes.default)
  console.log('✅ adminRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading adminRoutes:', error.message)
}

try {
  console.log('7. Testing userManagementRoutes...')
  const userManagementRoutes = await import('./routes/userManagementRoutes.js')
  app.use('/api/admin/users', userManagementRoutes.default)
  console.log('✅ userManagementRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading userManagementRoutes:', error.message)
}

try {
  console.log('8. Testing laborerManagementRoutes...')
  const laborerManagementRoutes = await import('./routes/laborerManagementRoutes.js')
  app.use('/api/laborers/management', laborerManagementRoutes.default)
  console.log('✅ laborerManagementRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading laborerManagementRoutes:', error.message)
}

try {
  console.log('9. Testing reviewRoutes...')
  const reviewRoutes = await import('./routes/reviewRoutes.js')
  app.use('/api/reviews', reviewRoutes.default)
  console.log('✅ reviewRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading reviewRoutes:', error.message)
}

try {
  console.log('10. Testing chatRoutes...')
  const chatRoutes = await import('./routes/chatRoutes.js')
  app.use('/api/chats', chatRoutes.default)
  console.log('✅ chatRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading chatRoutes:', error.message)
}

try {
  console.log('11. Testing categoryRoutes...')
  const categoryRoutes = await import('./routes/categoryRoutes.js')
  app.use('/api/categories', categoryRoutes.default)
  console.log('✅ categoryRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading categoryRoutes:', error.message)
}

try {
  console.log('12. Testing reportRoutes...')
  const reportRoutes = await import('./routes/reportRoutes.js')
  app.use('/api/support', reportRoutes.default)
  console.log('✅ reportRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading reportRoutes:', error.message)
}

try {
  console.log('13. Testing jobApplicationRoutes...')
  const jobApplicationRoutes = await import('./routes/jobApplicationRoutes.js')
  app.use('/api/applications', jobApplicationRoutes.default)
  console.log('✅ jobApplicationRoutes loaded successfully')
} catch (error) {
  console.error('❌ Error loading jobApplicationRoutes:', error.message)
}

console.log('All route tests completed!')

// Server Start
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`)
})