import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-app');
    console.log('Connected to MongoDB');

    // Find admin
    const admin = await Admin.findOne({ email: 'admin@labourconnect.com' });
    
    if (!admin) {
      console.log('❌ Admin not found!');
      process.exit(1);
    }

    console.log('✅ Admin found!');
    console.log('📧 Email:', admin.email);
    console.log('🆔 Admin ID:', admin.adminId);
    console.log('🔑 Has password:', !!admin.password);
    console.log('✅ Is active:', admin.isActive);
    console.log('👤 Role:', admin.role);

    // Test password
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log('🔐 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password does not match!');
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
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
checkAdmin(); 