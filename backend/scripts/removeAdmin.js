import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const removeAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-app');
    console.log('Connected to MongoDB');

    // Find the admin to remove
    const adminToRemove = await Admin.findOne({ email: 'admin2@labourconnect.com' });
    
    if (!adminToRemove) {
      console.log('❌ Admin with email admin2@labourconnect.com not found');
      return;
    }

    console.log('🔍 Found admin to remove:');
    console.log('📧 Email:', adminToRemove.email);
    console.log('👤 Name:', adminToRemove.name);
    console.log('🆔 Admin ID:', adminToRemove.adminId);
    console.log('🔑 Role:', adminToRemove.role);

    // Remove the admin
    await Admin.findByIdAndDelete(adminToRemove._id);
    console.log('✅ Admin removed successfully!');

    // Display remaining admins
    const remainingAdmins = await Admin.find({ isActive: true });
    const collaborators = await Admin.find({ isActive: true, isCollaborator: true });
    
    console.log('\n📊 Remaining Admin Statistics:');
    console.log(`Total Active Admins: ${remainingAdmins.length}`);
    console.log(`Total Collaborators: ${collaborators.length}/2`);
    
    console.log('\n👥 Remaining Admins:');
    remainingAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.role}`);
      console.log(`   Admin ID: ${admin.adminId}`);
      console.log(`   Collaborator: ${admin.isCollaborator ? 'Yes' : 'No'}`);
    });

    if (collaborators.length <= 2) {
      console.log('\n✅ Collaborator limit maintained: 2 or fewer');
    } else {
      console.log('\n⚠️ Warning: Still exceeding collaborator limit');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing admin:', error);
    process.exit(1);
  }
};

// Run the script
removeAdmin(); 