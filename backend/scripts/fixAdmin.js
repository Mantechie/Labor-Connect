import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const fixAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-app');
    console.log('Connected to MongoDB');

    // Delete existing admin
    const deletedAdmin = await Admin.findOneAndDelete({ email: 'admin@labourconnect.com' });
    if (deletedAdmin) {
      console.log('🗑️ Deleted existing admin with invalid password');
    }

    // Create new admin with proper password hashing
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

    const newAdmin = new Admin(adminData);
    await newAdmin.save();

    console.log('✅ Admin created successfully with proper password!');
    console.log('📧 Email:', newAdmin.email);
    console.log('🔑 Password: admin123');
    console.log('🆔 Admin ID:', newAdmin.adminId);
    console.log('👤 Role:', newAdmin.role);
    console.log('✅ Is active:', newAdmin.isActive);
    console.log('🔐 Has password:', !!newAdmin.password);

    // Test the password
    const bcrypt = await import('bcryptjs');
    const isMatch = await bcrypt.default.compare('admin123', newAdmin.password);
    console.log('🔐 Password test successful:', isMatch);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
fixAdmin(); 