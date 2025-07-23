import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Laborer from './models/Laborer.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/labourconnect');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Test laborer data
const testLaborers = [
  {
    name: 'Rakesh Kumar',
    email: 'rakesh.mason@example.com',
    phone: '+919876543210',
    specialization: 'mason',
    experience: 6,
    rating: 4.8,
    numReviews: 45,
    availability: 'online',
    totalEarnings: 52000,
    complaintsReceived: [
      {
        reason: 'Late arrival',
        details: 'Arrived 30 minutes late to the job site',
        severity: 'low',
        status: 'resolved',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      }
    ],
    isVerified: true,
    isApproved: true,
    address: 'Sector 15, Gurgaon, Haryana'
  },
  {
    name: 'Imran Sheikh',
    email: 'imran.electrician@example.com',
    phone: '+919876543211',
    specialization: 'electrician',
    experience: 2,
    rating: 3.9,
    numReviews: 23,
    availability: 'busy',
    totalEarnings: 18300,
    complaintsReceived: [
      {
        reason: 'Poor work quality',
        details: 'Wiring was not done properly, had to be redone',
        severity: 'high',
        status: 'investigating',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        reason: 'Unprofessional behavior',
        details: 'Was rude to the client',
        severity: 'medium',
        status: 'resolved',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        reason: 'Overcharging',
        details: 'Charged more than agreed amount',
        severity: 'high',
        status: 'pending',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        reason: 'No show',
        details: 'Did not show up for scheduled work',
        severity: 'critical',
        status: 'pending',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ],
    isVerified: true,
    isApproved: true,
    address: 'Karol Bagh, New Delhi'
  },
  {
    name: 'Lakhan Singh',
    email: 'lakhan.plumber@example.com',
    phone: '+919876543212',
    specialization: 'plumber',
    experience: 4,
    rating: 4.2,
    numReviews: 38,
    availability: 'online',
    totalEarnings: 35000,
    complaintsReceived: [], // No complaints
    isVerified: true,
    isApproved: true,
    address: 'Lajpat Nagar, New Delhi'
  },
  {
    name: 'Suresh Yadav',
    email: 'suresh.carpenter@example.com',
    phone: '+919876543213',
    specialization: 'carpenter',
    experience: 8,
    rating: 4.6,
    numReviews: 67,
    availability: 'online',
    totalEarnings: 78500,
    complaintsReceived: [
      {
        reason: 'Incomplete work',
        details: 'Left the job halfway through',
        severity: 'medium',
        status: 'resolved',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
      },
      {
        reason: 'Material wastage',
        details: 'Wasted expensive wood materials',
        severity: 'medium',
        status: 'resolved',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      }
    ],
    isVerified: true,
    isApproved: true,
    address: 'Rohini, New Delhi'
  },
  {
    name: 'Amit Sharma',
    email: 'amit.painter@example.com',
    phone: '+919876543214',
    specialization: 'painter',
    experience: 1,
    rating: 3.2,
    numReviews: 12,
    availability: 'online',
    totalEarnings: 8900,
    complaintsReceived: [
      {
        reason: 'Poor finish quality',
        details: 'Paint job was not smooth, visible brush marks',
        severity: 'medium',
        status: 'pending',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ],
    isVerified: false,
    isApproved: true,
    address: 'Dwarka, New Delhi'
  },
  {
    name: 'Ravi Kumar',
    email: 'ravi.welder@example.com',
    phone: '+919876543215',
    specialization: 'welder',
    experience: 5,
    rating: 4.4,
    numReviews: 29,
    availability: 'offline',
    totalEarnings: 45000,
    complaintsReceived: [],
    isVerified: true,
    isApproved: true,
    address: 'Faridabad, Haryana'
  },
  {
    name: 'Mohammad Ali',
    email: 'mohammad.mason@example.com',
    phone: '+919876543216',
    specialization: 'mason',
    experience: 12,
    rating: 4.9,
    numReviews: 89,
    availability: 'online',
    totalEarnings: 125000,
    complaintsReceived: [
      {
        reason: 'Delay in completion',
        details: 'Project took longer than expected',
        severity: 'low',
        status: 'resolved',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      }
    ],
    isVerified: true,
    isApproved: true,
    address: 'Old Delhi, Delhi'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.electrician@example.com',
    phone: '+919876543217',
    specialization: 'electrician',
    experience: 3,
    rating: 3.8,
    numReviews: 15,
    availability: 'busy',
    totalEarnings: 22000,
    complaintsReceived: [
      {
        reason: 'Safety concerns',
        details: 'Did not follow proper safety protocols',
        severity: 'high',
        status: 'pending',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        reason: 'Incomplete work',
        details: 'Left some connections incomplete',
        severity: 'medium',
        status: 'investigating',
        from: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ],
    isVerified: false,
    isApproved: true,
    address: 'Noida, Uttar Pradesh'
  }
];

const addTestLaborers = async () => {
  try {
    console.log('🧪 Adding test laborers...');
    
    for (const laborerData of testLaborers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: laborerData.email });
      if (existingUser) {
        console.log(`⏭️ User ${laborerData.name} already exists, skipping...`);
        continue;
      }

      // Create user account
      const hashedPassword = await bcrypt.hash('laborer123', 10);
      const user = new User({
        name: laborerData.name,
        email: laborerData.email,
        phone: laborerData.phone,
        password: hashedPassword,
        role: 'laborer',
        address: laborerData.address,
        isActive: true
      });

      const savedUser = await user.save();
      console.log(`✅ Created user: ${laborerData.name}`);

      // Create laborer profile
      const laborer = new Laborer({
        user: savedUser._id,
        specialization: laborerData.specialization,
        experience: laborerData.experience,
        rating: laborerData.rating,
        numReviews: laborerData.numReviews,
        availability: laborerData.availability,
        totalEarnings: laborerData.totalEarnings,
        complaintsReceived: laborerData.complaintsReceived,
        isVerified: laborerData.isVerified,
        isApproved: laborerData.isApproved,
        status: 'active'
      });

      await laborer.save();
      console.log(`✅ Created laborer profile: ${laborerData.name} (${laborerData.specialization})`);
    }

    console.log('\n🎉 All test laborers added successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Total laborers: ${testLaborers.length}`);
    console.log(`- Specializations: ${[...new Set(testLaborers.map(l => l.specialization))].join(', ')}`);
    console.log(`- Online: ${testLaborers.filter(l => l.availability === 'online').length}`);
    console.log(`- Busy: ${testLaborers.filter(l => l.availability === 'busy').length}`);
    console.log(`- Offline: ${testLaborers.filter(l => l.availability === 'offline').length}`);
    console.log(`- With complaints: ${testLaborers.filter(l => l.complaintsReceived.length > 0).length}`);
    console.log(`- Flagged (3+ complaints): ${testLaborers.filter(l => l.complaintsReceived.length > 3).length}`);
    console.log(`- Verified: ${testLaborers.filter(l => l.isVerified).length}`);
    console.log(`- Unverified: ${testLaborers.filter(l => !l.isVerified).length}`);
    
    console.log('\n💡 Test credentials:');
    console.log('Email: rakesh.mason@example.com | Password: laborer123');
    console.log('Email: imran.electrician@example.com | Password: laborer123');
    console.log('Email: lakhan.plumber@example.com | Password: laborer123');
    
  } catch (error) {
    console.error('❌ Error adding test laborers:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
connectDB().then(() => {
  addTestLaborers();
});