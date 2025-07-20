import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const setupAdminCollaboration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-app');
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists:', existingSuperAdmin.email);
      
      // Update super admin to be collaborator
      existingSuperAdmin.isCollaborator = true;
      await existingSuperAdmin.save();
      console.log('✅ Super admin set as collaborator');
    } else {
      // Create super admin
      const superAdminData = {
        name: 'System Administrator',
        email: 'admin@labourconnect.com',
        phone: '9876543210',
        password: 'admin123',
        role: 'super_admin',
        department: 'general',
        isCollaborator: true,
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
        ],
        isActive: true
      };

      const superAdmin = new Admin(superAdminData);
      await superAdmin.save();

      console.log('✅ Super admin created successfully!');
      console.log('📧 Email:', superAdmin.email);
      console.log('🔑 Password: admin123');
      console.log('🆔 Admin ID:', superAdmin.adminId);
    }

    // Check if second admin exists
    const existingSecondAdmin = await Admin.findOne({ email: 'admin2@labourconnect.com' });
    
    if (existingSecondAdmin) {
      console.log('✅ Second admin already exists:', existingSecondAdmin.email);
    } else {
      // Create second admin collaborator
      const secondAdminData = {
        name: 'Assistant Administrator',
        email: 'admin2@labourconnect.com',
        phone: '9876543211',
        password: 'admin123',
        role: 'admin',
        department: 'operations',
        isCollaborator: true,
        permissions: [
          'manage_users',
          'manage_laborers',
          'manage_jobs',
          'view_analytics'
        ],
        isActive: true
      };

      const secondAdmin = new Admin(secondAdminData);
      await secondAdmin.save();

      console.log('✅ Second admin collaborator created successfully!');
      console.log('📧 Email:', secondAdmin.email);
      console.log('🔑 Password: admin123');
      console.log('🆔 Admin ID:', secondAdmin.adminId);
    }

    // Display collaboration status
    const collaborators = await Admin.find({ isCollaborator: true, isActive: true });
    console.log('\n👥 Collaboration Status:');
    console.log(`Total Collaborators: ${collaborators.length}/2`);
    collaborators.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.role}`);
    });

    console.log('\n🎯 Admin Collaboration System Ready!');
    console.log('• Maximum 2 active collaborators allowed');
    console.log('• Super admin can manage collaborators');
    console.log('• Each admin has profile management features');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin collaboration:', error);
    process.exit(1);
  }
};

// Run the script
setupAdminCollaboration(); 