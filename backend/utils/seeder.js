import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Laborer from '../models/Laborer.js'
import Job from '../models/Job.js'
import Review from '../models/Review.js'
import connectDB from '../config/db.js'

dotenv.config()

const seedData = async () => {
  try {
    // Connect to database
    await connectDB()

    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Laborer.deleteMany({})
    await Job.deleteMany({})
    await Review.deleteMany({})

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@laborconnect.com',
      password: adminPassword,
      phone: '+1234567890',
      role: 'admin',
      isApproved: true
    })

    // Create sample users
    const userPassword = await bcrypt.hash('password123', 10)
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        phone: '+1234567891',
        address: '123 Main St, New York, NY',
        role: 'user',
        isApproved: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: userPassword,
        phone: '+1234567892',
        address: '456 Oak Ave, Los Angeles, CA',
        role: 'user',
        isApproved: true
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: userPassword,
        phone: '+1234567893',
        address: '789 Pine St, Chicago, IL',
        role: 'user',
        isApproved: true
      }
    ])

    // Create sample laborers
    const laborers = await User.create([
      {
        name: 'Ramesh Kumar',
        email: 'ramesh@example.com',
        password: userPassword,
        phone: '+1234567894',
        address: '321 Elm St, Houston, TX',
        role: 'laborer',
        specialization: 'electrician',
        isApproved: true,
        isAvailable: true,
        rating: 4.8,
        numReviews: 25
      },
      {
        name: 'Sita Devi',
        email: 'sita@example.com',
        password: userPassword,
        phone: '+1234567895',
        address: '654 Maple Ave, Phoenix, AZ',
        role: 'laborer',
        specialization: 'plumber',
        isApproved: true,
        isAvailable: true,
        rating: 4.6,
        numReviews: 18
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: userPassword,
        phone: '+1234567896',
        address: '987 Cedar Rd, Philadelphia, PA',
        role: 'laborer',
        specialization: 'mason',
        isApproved: true,
        isAvailable: true,
        rating: 4.7,
        numReviews: 32
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: userPassword,
        phone: '+1234567897',
        address: '147 Birch Ln, San Antonio, TX',
        role: 'laborer',
        specialization: 'carpenter',
        isApproved: true,
        isAvailable: true,
        rating: 4.9,
        numReviews: 41
      },
      {
        name: 'Amit Singh',
        email: 'amit@example.com',
        password: userPassword,
        phone: '+1234567898',
        address: '258 Spruce St, San Diego, CA',
        role: 'laborer',
        specialization: 'painter',
        isApproved: false,
        isAvailable: true,
        rating: 0,
        numReviews: 0
      }
    ])

    // Create Laborer profiles for laborer users
    const laborerProfiles = await Laborer.create([
      {
        user: laborers[0]._id,
        specialization: 'electrician',
        experience: 8,
        documents: ['https://example.com/cert1.pdf'],
        photos: ['https://example.com/work1.jpg', 'https://example.com/work2.jpg'],
        isApproved: true,
        isAvailable: true,
        rating: 4.8,
        numReviews: 25
      },
      {
        user: laborers[1]._id,
        specialization: 'plumber',
        experience: 5,
        documents: ['https://example.com/cert2.pdf'],
        photos: ['https://example.com/work3.jpg'],
        isApproved: true,
        isAvailable: true,
        rating: 4.6,
        numReviews: 18
      },
      {
        user: laborers[2]._id,
        specialization: 'mason',
        experience: 12,
        documents: ['https://example.com/cert3.pdf'],
        photos: ['https://example.com/work4.jpg', 'https://example.com/work5.jpg'],
        isApproved: true,
        isAvailable: true,
        rating: 4.7,
        numReviews: 32
      },
      {
        user: laborers[3]._id,
        specialization: 'carpenter',
        experience: 15,
        documents: ['https://example.com/cert4.pdf'],
        photos: ['https://example.com/work6.jpg', 'https://example.com/work7.jpg'],
        isApproved: true,
        isAvailable: true,
        rating: 4.9,
        numReviews: 41
      },
      {
        user: laborers[4]._id,
        specialization: 'painter',
        experience: 3,
        documents: ['https://example.com/cert5.pdf'],
        photos: ['https://example.com/work8.jpg'],
        isApproved: false,
        isAvailable: true,
        rating: 0,
        numReviews: 0
      }
    ])

    // Create sample jobs
    const jobs = await Job.create([
      {
        title: 'Electrical Wiring for New House',
        description: 'Need complete electrical wiring for a 3-bedroom house. All materials will be provided.',
        category: 'electrician',
        location: 'New York, NY',
        budget: 2500,
        postedBy: users[0]._id,
        contact: {
          phone: '+1234567891',
          email: 'john@example.com'
        },
        status: 'open',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        title: 'Kitchen Plumbing Repair',
        description: 'Kitchen sink and dishwasher plumbing needs repair. Leaking pipes need to be fixed.',
        category: 'plumber',
        location: 'Los Angeles, CA',
        budget: 800,
        postedBy: users[1]._id,
        assignedLaborer: laborers[1]._id,
        contact: {
          phone: '+1234567892',
          email: 'jane@example.com'
        },
        status: 'in progress',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      },
      {
        title: 'Bathroom Renovation',
        description: 'Complete bathroom renovation including tiling, plumbing, and electrical work.',
        category: 'mason',
        location: 'Chicago, IL',
        budget: 5000,
        postedBy: users[2]._id,
        contact: {
          phone: '+1234567893',
          email: 'mike@example.com'
        },
        status: 'open',
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      {
        title: 'Custom Wooden Furniture',
        description: 'Need custom wooden dining table and chairs for family of 6.',
        category: 'carpenter',
        location: 'Houston, TX',
        budget: 1500,
        postedBy: users[0]._id,
        assignedLaborer: laborers[3]._id,
        contact: {
          phone: '+1234567891',
          email: 'john@example.com'
        },
        status: 'completed',
        scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        title: 'House Exterior Painting',
        description: 'Need exterior painting for 2-story house. Paint will be provided.',
        category: 'painter',
        location: 'Phoenix, AZ',
        budget: 3000,
        postedBy: users[1]._id,
        contact: {
          phone: '+1234567892',
          email: 'jane@example.com'
        },
        status: 'open',
        scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
      }
    ])

    // Create sample reviews
    const reviews = await Review.create([
      {
        user: users[0]._id,
        laborer: laborers[3]._id,
        job: jobs[3]._id,
        rating: 5,
        comment: 'Excellent work! Very professional and delivered on time. Highly recommended.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        user: users[1]._id,
        laborer: laborers[1]._id,
        job: jobs[1]._id,
        rating: 4,
        comment: 'Good work, but took a bit longer than expected. Overall satisfied.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        user: users[2]._id,
        laborer: laborers[0]._id,
        rating: 5,
        comment: 'Amazing electrician! Fixed all our electrical issues quickly and efficiently.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        user: users[0]._id,
        laborer: laborers[2]._id,
        rating: 4,
        comment: 'Great masonry work. Very skilled and reasonable pricing.',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      }
    ])

    console.log('✅ Database seeded successfully!')
    console.log(`📊 Created:`)
    console.log(`   - 1 Admin user`)
    console.log(`   - 3 Regular users`)
    console.log(`   - 5 Laborers`)
    console.log(`   - 5 Laborer profiles`)
    console.log(`   - 5 Jobs`)
    console.log(`   - 4 Reviews`)
    
    console.log('\n🔑 Login credentials:')
    console.log('Admin: admin@laborconnect.com / admin123')
    console.log('User: john@example.com / password123')
    console.log('Laborer: ramesh@example.com / password123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run seeder if called directly
if (process.argv[2] === 'seed') {
  seedData()
}

export default seedData