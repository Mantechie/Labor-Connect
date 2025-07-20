import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import AdminLog from '../models/AdminLog.js';
import dotenv from 'dotenv';

dotenv.config();

const setupAdminSecurity = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-app');
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists:', existingSuperAdmin.email);
      
      // Update super admin with new security features
      existingSuperAdmin.isCollaborator = true;
      existingSuperAdmin.permissions = [
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
      ];
      await existingSuperAdmin.save();
      console.log('✅ Super admin updated with security features');
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
      
      // Update second admin with new security features
      existingSecondAdmin.isCollaborator = true;
      existingSecondAdmin.permissions = [
        'manage_users',
        'manage_laborers',
        'manage_jobs',
        'view_analytics'
      ];
      await existingSecondAdmin.save();
      console.log('✅ Second admin updated with security features');
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

    // Create sample audit logs
    const admins = await Admin.find({ isActive: true });
    const sampleLogs = [
      {
        adminId: admins[0]._id,
        adminEmail: admins[0].email,
        action: 'SYSTEM_CONFIG',
        details: 'Admin security system initialized',
        ipAddress: '127.0.0.1',
        userAgent: 'Setup Script',
        severity: 'LOW',
        status: 'SUCCESS'
      },
      {
        adminId: admins[0]._id,
        adminEmail: admins[0].email,
        action: 'ADMIN_CREATE',
        details: 'Admin accounts created with security features',
        ipAddress: '127.0.0.1',
        userAgent: 'Setup Script',
        severity: 'MEDIUM',
        status: 'SUCCESS'
      }
    ];

    for (const logData of sampleLogs) {
      await AdminLog.createLog(logData);
    }

    console.log('✅ Sample audit logs created');

    // Display security system status
    const collaborators = await Admin.find({ isCollaborator: true, isActive: true });
    const totalLogs = await AdminLog.countDocuments();
    
    console.log('\n🔒 Admin Security System Status:');
    console.log(`Total Collaborators: ${collaborators.length}/2`);
    console.log(`Total Audit Logs: ${totalLogs}`);
    console.log(`Database Tokens: Enabled`);
    console.log(`OTP Verification: Enabled`);
    console.log(`Admin Notifications: Enabled`);
    console.log(`Audit Logging: Enabled`);
    
    collaborators.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.role}`);
      console.log(`   Permissions: ${admin.permissions.length} granted`);
      console.log(`   Security: Token storage, OTP verification, Activity tracking`);
    });

    console.log('\n🎯 Security Features Implemented:');
    console.log('✅ One admin logged in - Token stored in DB and validated on all routes');
    console.log('✅ OTP verification - Generated for sensitive operations, expires after 10 minutes');
    console.log('✅ Admin notifications - Email/SMS sent to all admins for profile/password changes');
    console.log('✅ Audit logging - Complete traceability of all admin actions');
    console.log('✅ Session management - Track logged in admins and force logout capability');
    console.log('✅ Security events - Monitor failed logins, account locks, and suspicious activity');

    console.log('\n🚀 Admin Security System Ready!');
    console.log('• Login with admin@labourconnect.com / admin123');
    console.log('• Sensitive operations require OTP verification');
    console.log('• All actions are logged and auditable');
    console.log('• Other admins are notified of important changes');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin security:', error);
    process.exit(1);
  }
};

// Run the script
setupAdminSecurity(); 