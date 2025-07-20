import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const createSpecificAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-app');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'crostophilic2@gmail.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin.email);
      console.log('🆔 Admin ID:', existingAdmin.adminId);
      console.log('👤 Name:', existingAdmin.name);
      console.log('📧 Email:', existingAdmin.email);
      console.log('📱 Phone:', existingAdmin.phone);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('🏢 Department:', existingAdmin.department);
      console.log('✅ Is Active:', existingAdmin.isActive);
      console.log('🤝 Is Collaborator:', existingAdmin.isCollaborator);
      return;
    }

    // Create new admin with provided credentials
    const adminData = {
      name: 'Crostophilic Admin',
      email: 'crostophilic2@gmail.com',
      phone: '9876543212', // You can update this
      password: '$2b$10$YG//8IRUxT38ppSu5sLEVuaKMmGEJBwN9qhtKoGBvOudEJRGNHuJO',
      role: 'admin',
      department: 'general',
      isCollaborator: true,
      permissions: [
        'manage_users',
        'manage_laborers',
        'manage_jobs',
        'view_analytics'
      ],
      isActive: true
    };

    const newAdmin = new Admin(adminData);
    await newAdmin.save();

    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', newAdmin.email);
    console.log('🆔 Admin ID:', newAdmin.adminId);
    console.log('👤 Name:', newAdmin.name);
    console.log('📱 Phone:', newAdmin.phone);
    console.log('🔑 Role:', newAdmin.role);
    console.log('🏢 Department:', newAdmin.department);
    console.log('✅ Is Active:', newAdmin.isActive);
    console.log('🤝 Is Collaborator:', newAdmin.isCollaborator);
    console.log('🔐 Password: Already hashed and set');
    console.log('🔒 Security Features: Token storage, OTP verification, Activity tracking');

    // Display total admin count
    const totalAdmins = await Admin.countDocuments({ isActive: true });
    const collaborators = await Admin.countDocuments({ isActive: true, isCollaborator: true });
    
    console.log('\n📊 Admin Statistics:');
    console.log(`Total Active Admins: ${totalAdmins}`);
    console.log(`Total Collaborators: ${collaborators}/2`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Run the script
createSpecificAdmin(); 