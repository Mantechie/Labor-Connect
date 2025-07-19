import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const fixAdmin = async () => {
  try {
    console.log('🚀 Starting admin seeder...');
    
    // Connect to MongoDB using the same config as the server
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/labor-connect';
    console.log('📡 Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@labourconnect.com' });
    if (existingAdmin) {
      console.log('🗑️ Found existing admin, deleting...');
      await Admin.findByIdAndDelete(existingAdmin._id);
      console.log('✅ Existing admin deleted');
    }

    // Create new admin with proper password hashing
    console.log('👤 Creating new admin...');
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

    console.log('📝 Admin data prepared:', {
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
      permissions: adminData.permissions.length
    });

    const newAdmin = new Admin(adminData);
    console.log('💾 Saving admin to database...');
    
    const savedAdmin = await newAdmin.save();
    console.log('✅ Admin saved successfully!');

    // Verify the admin was actually saved
    console.log('🔍 Verifying admin in database...');
    const verifiedAdmin = await Admin.findById(savedAdmin._id).select('+password');
    
    if (!verifiedAdmin) {
      throw new Error('Admin was not found in database after saving');
    }

    console.log('✅ Admin verification successful!');
    console.log('📧 Email:', verifiedAdmin.email);
    console.log('🔑 Password: admin123');
    console.log('🆔 Admin ID:', verifiedAdmin.adminId);
    console.log('👤 Role:', verifiedAdmin.role);
    console.log('✅ Is active:', verifiedAdmin.isActive);
    console.log('🔐 Has password:', !!verifiedAdmin.password);
    console.log('📅 Created at:', verifiedAdmin.createdAt);

    // Test the password
    console.log('🔐 Testing password...');
    const bcrypt = await import('bcryptjs');
    const isMatch = await bcrypt.default.compare('admin123', verifiedAdmin.password);
    console.log('🔐 Password test successful:', isMatch);

    // Test admin login method
    console.log('🔑 Testing admin login method...');
    const loginTest = await verifiedAdmin.matchPassword('admin123');
    console.log('🔑 Login method test successful:', loginTest);

    // Count total admins in database
    const adminCount = await Admin.countDocuments();
    console.log('📊 Total admins in database:', adminCount);

    console.log('🎉 Admin seeder completed successfully!');
    console.log('🚀 You can now login with:');
    console.log('   Email: admin@labourconnect.com');
    console.log('   Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error in admin seeder:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    process.exit(1);
  }
};

// Run the script
fixAdmin(); 