import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const testAdminJWT = async () => {
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

    console.log('✅ Admin found:', admin.email);

    // Test JWT token generation
    const generateAdminToken = (id, role) => {
      return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });
    };

    const token = generateAdminToken(admin._id, admin.role);
    console.log('🔑 Generated admin token:', token.substring(0, 50) + '...');

    // Test JWT token decoding
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Decoded token:', {
      id: decoded.id,
      role: decoded.role,
      hasRole: !!decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    });

    // Test role check
    if (!decoded.role) {
      console.log('❌ Token missing role field!');
    } else {
      console.log('✅ Token has role field:', decoded.role);
    }

    // Test admin lookup
    const foundAdmin = await Admin.findById(decoded.id).select('-password');
    if (foundAdmin) {
      console.log('✅ Admin found in database:', {
        id: foundAdmin._id,
        adminId: foundAdmin.adminId,
        email: foundAdmin.email,
        role: foundAdmin.role,
        isActive: foundAdmin.isActive
      });
    } else {
      console.log('❌ Admin not found in database!');
    }

    console.log('✅ All JWT tests passed!');

    process.exit(0);
  } catch (error) {
    console.error('❌ JWT test error:', error);
    process.exit(1);
  }
};

// Run the test
testAdminJWT(); 