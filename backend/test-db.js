import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import config from './config/env.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    return false;
  }
};

// Test database operations
const testDatabase = async () => {
  console.log('🔍 Testing database connection...');
  
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Check if any users exist
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

    // List all users
    const users = await User.find({}, 'name email role').limit(10);
    console.log('👥 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Create a test user if none exist
    if (userCount === 0) {
      console.log('🔧 Creating test user...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
        phone: '1234567890'
      });

      await testUser.save();
      console.log('✅ Test user created: test@example.com / password123');
    }

    // Create a test admin if none exist
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('🔧 Creating test admin...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const testAdmin = new User({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        phone: '9876543210'
      });

      await testAdmin.save();
      console.log('✅ Test admin created: admin@example.com / admin123');
    }

    console.log('✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

testDatabase();