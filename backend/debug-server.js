import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import config from './config/env.js'

// Import routes one by one to isolate the issue
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import laborerRoutes from './routes/laborerRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import adminAuthRoutes from './routes/adminAuthRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import userManagementRoutes from './routes/userManagementRoutes.js'
import laborerManagementRoutes from './routes/laborerManagementRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import jobApplicationRoutes from './routes/jobApplicationRoutes.js'

// Connect to MongoDB
connectDB()

const app = express()

// Basic middleware
app.use(express.json())
app.use(cors())

console.log('Starting route mounting...')

try {
  console.log('1. Mounting authRoutes...')
  app.use('/api/auth', authRoutes)
  console.log('✅ authRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting authRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('2. Mounting userRoutes...')
  app.use('/api/users', userRoutes)
  console.log('✅ userRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting userRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('3. Mounting adminAuthRoutes...')
  app.use('/api/admin/auth', adminAuthRoutes)
  console.log('✅ adminAuthRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting adminAuthRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('4. Mounting userManagementRoutes...')
  app.use('/api/admin/users', userManagementRoutes)
  console.log('✅ userManagementRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting userManagementRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('5. Mounting laborerManagementRoutes...')
  app.use('/api/laborers/management', laborerManagementRoutes)
  console.log('✅ laborerManagementRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting laborerManagementRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('6. Mounting laborerRoutes...')
  app.use('/api/laborers', laborerRoutes)
  console.log('✅ laborerRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting laborerRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('7. Mounting jobRoutes...')
  app.use('/api/jobs', jobRoutes)
  console.log('✅ jobRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting jobRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('8. Mounting adminRoutes...')
  app.use('/api/admin', adminRoutes)
  console.log('✅ adminRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting adminRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('9. Mounting reviewRoutes...')
  app.use('/api/reviews', reviewRoutes)
  console.log('✅ reviewRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting reviewRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('10. Mounting chatRoutes...')
  app.use('/api/chats', chatRoutes)
  console.log('✅ chatRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting chatRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('11. Mounting categoryRoutes...')
  app.use('/api/categories', categoryRoutes)
  console.log('✅ categoryRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting categoryRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('12. Mounting reportRoutes...')
  app.use('/api/support', reportRoutes)
  console.log('✅ reportRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting reportRoutes:', error.message)
  process.exit(1)
}

try {
  console.log('13. Mounting jobApplicationRoutes...')
  app.use('/api/applications', jobApplicationRoutes)
  console.log('✅ jobApplicationRoutes mounted')
} catch (error) {
  console.error('❌ Error mounting jobApplicationRoutes:', error.message)
  process.exit(1)
}

console.log('All routes mounted successfully!')

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Debug server running' })
})

// Start server
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`🚀 Debug server running on port ${PORT}`)
})