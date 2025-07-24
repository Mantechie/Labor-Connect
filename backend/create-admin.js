import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';
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

// Create admin user
const createAdmin = async () => {
  console.log('🔧 Creating admin user...');
  
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Check if admin already exists by email or phone
    const existingAdmin = await Admin.findOne({ 
      $or: [
        { email: 'admin@example.com' },
        { phone: '9876543210' }
      ]
    });
    
    if (existingAdmin) {
      console.log('✅ Admin already exists:');
      console.log('Admin details:', {
        name: existingAdmin.name,
        email: existingAdmin.email,
        phone: existingAdmin.phone,
        role: existingAdmin.role,
        isActive: existingAdmin.isActive
      });
      console.log('Login credentials:');
      console.log('Email:', existingAdmin.email);
      console.log('Password: admin123 (if not changed)');
    } else {
      // Create new admin
      const newAdmin = new Admin({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'admin123', // This will be hashed by the pre-save middleware
        phone: '9876543210',
        role: 'super_admin',
        department: 'general',
        permissions: [
          'manage_users',
          'manage_laborers', 
          'manage_jobs',
          'manage_reviews',
          'manage_documents',
          'manage_reports',
          'manage_notifications',
          'view_analytics',
          'system_settings',
          'manage_admins'
        ]
      });

      await newAdmin.save();
      console.log('✅ Admin created successfully!');
      console.log('Login credentials:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    }

    // List all admins
    const admins = await Admin.find({}, 'name email role isActive').limit(10);
    console.log('\n👥 Admins in database:');
    admins.forEach(admin => {
      console.log(`  - ${admin.name} (${admin.email}) - Role: ${admin.role} - Active: ${admin.isActive}`);
    });

    console.log('\n✅ Admin setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Admin creation failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

createAdmin();