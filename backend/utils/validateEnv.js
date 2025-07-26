/**
 * Validates required environment variables at application startup
 * Exits the process if required variables are missing
 */
export const validateEnv = () => {
  console.log('Validating environment variables...');
  
  const required = [
    'JWT_SECRET',
    'MONGO_URI',
    'NODE_ENV'
  ];
  
  const recommended = [
    'JWT_ACCESS_EXPIRY',
    'JWT_REFRESH_EXPIRY',
    'JWT_REFRESH_SECRET',
    'EMAIL_SERVICE',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM'
  ];
  
  // Check required variables
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  
  // Check recommended variables
  const missingRecommended = recommended.filter(key => !process.env[key]);
  
  if (missingRecommended.length > 0) {
    console.warn('⚠️ Missing recommended environment variables:');
    missingRecommended.forEach(key => console.warn(`   - ${key}`));
  }
  
  // Validate format of certain variables
  if (process.env.JWT_EXPIRE && !/^\d+[smhd]$/.test(process.env.JWT_EXPIRE)) {
    console.error('❌ JWT_EXPIRE must be in format like 15m, 1h, 7d');
    process.exit(1);
  }
  
  if (process.env.JWT_ACCESS_SECRET && !/^\d+[smhd]$/.test(process.env.JWT_ACCESS_EXPIRY)) {
    console.error('❌ JWT_ACCESS_EXPIRY must be in format like 15m, 1h, 7d');
    process.exit(1);
  }
  
  if (process.env.JWT_REFRESH_SECRET && !/^\d+[smhd]$/.test(process.env.JWT_REFRESH_EXPIRY)) {
    console.error('❌ JWT_REFRESH_EXPIRY must be in format like 7d, 30d, 60d');
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
};

export default validateEnv;
