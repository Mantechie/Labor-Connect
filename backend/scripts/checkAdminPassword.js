import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const checkAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-app');
    console.log('Connected to MongoDB');

    // Find admin
    const admin = await Admin.findOne({ email: 'admin@labourconnect.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin not found!');
      process.exit(1);
    }

    console.log('✅ Admin found:', admin.email);
    console.log('🔍 Admin details:', {
      id: admin._id,
      adminId: admin.adminId,
      email: admin.email,
      hasPassword: !!admin.password,
      passwordLength: admin.password ? admin.password.length : 0,
      isActive: admin.isActive,
      role: admin.role
    });

    // Test password comparison
    const testPassword = 'admin123';
    console.log('🔐 Testing password:', testPassword);
    
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log('🔐 Password match result:', isMatch);
    
    if (isMatch) {
      console.log('✅ Password is correct!');
    } else {
      console.log('❌ Password is incorrect!');
      
      // Let's try to recreate the admin with the correct password
      console.log('🔧 Recreating admin with correct password...');
      
      // Delete existing admin
      await Admin.findByIdAndDelete(admin._id);
      
      // Create new admin with correct password
      const newAdmin = new Admin({
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
      });

      await newAdmin.save();
      console.log('✅ Admin recreated successfully!');
      console.log('📧 Email:', newAdmin.email);
      console.log('🔑 Password: admin123');
      console.log('🆔 Admin ID:', newAdmin.adminId);
      
      // Test the new password
      const newIsMatch = await bcrypt.compare('admin123', newAdmin.password);
      console.log('🔐 New password test:', newIsMatch);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
checkAdminPassword(); 