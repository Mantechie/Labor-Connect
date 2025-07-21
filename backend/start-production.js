#!/usr/bin/env node

// Production startup script
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load production environment variables
config({ path: path.join(__dirname, '.env.production') });

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

// Disable console.log in production (optional)
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Starting Labour Connect API in production mode...');
  console.log('📊 Environment:', process.env.NODE_ENV);
  console.log('🔌 Port:', process.env.PORT || 8080);
  console.log('🌐 CORS Origin:', process.env.CORS_ORIGIN);
  
  // Override console.log for production (uncomment if you want to disable all logs)
  // console.log = () => {};
  // console.info = () => {};
  // console.warn = () => {};
}

// Start the server
import('./server.js');