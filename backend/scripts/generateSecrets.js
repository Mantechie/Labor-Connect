import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a secure random string for use as a secret
 * @param {number} length - Length of the secret in bytes
 * @returns {string} - Hex string of random bytes
 */
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Updates environment variables in .env files
 */
const updateEnvFiles = () => {
  const envPaths = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '.env.production')
  ];
  
  const secrets = {
    JWT_SECRET: generateSecret(),
    JWT_REFRESH_SECRET: generateSecret(),
    ADMIN_JWT_SECRET: generateSecret(),
    ADMIN_JWT_REFRESH_SECRET: generateSecret(),
    COOKIE_SECRET: generateSecret(32),
    SESSION_SECRET: generateSecret(32)
  };
  
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace each secret in the file
      for (const [key, value] of Object.entries(secrets)) {
        const regex = new RegExp(`${key}=.*`, 'g');
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          // Add the secret if it doesn't exist
          envContent += `\n${key}=${value}`;
        }
      }
      
      // Write updated content back to file
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Updated secrets in ${envPath}`);
    } else {
      console.log(`❌ File not found: ${envPath}`);
    }
  }
};

// Run the script
console.log('🔐 Generating secure secrets...');
updateEnvFiles();
console.log('✅ Secret generation complete!');
console.log('⚠️ Remember to restart your server for changes to take effect.');
