import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import { notFound, errorHandler } from './middlewares/errorMiddleware.js'
import path from 'path'
import { fileURLToPath } from 'url'


// Load environment variables
dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Middleware
app.use(express.json()) // For JSON body parsing
app.use(cors())
app.use(morgan('dev'))

// API Routes
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/chats', chatRoutes)

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
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})
