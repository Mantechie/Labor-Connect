import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const createInitialAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-app');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@labourconnect.com' });
    
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create initial admin
    const adminData = {
      name: 'System Administrator',
      email: 'admin@labourconnect.com',
      phone: '9876543210',
      password: 'admin123',
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
        'system_settings'
      ],
      isActive: true
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ Initial admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123');
    console.log('🆔 Admin ID:', admin.adminId);
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Run the script
createInitialAdmin(); 