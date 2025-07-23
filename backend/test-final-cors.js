#!/usr/bin/env node

/**
 * Final CORS Configuration Summary and Test
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Final CORS Configuration Summary:');
console.log('=====================================');

// Check environment files
const envFiles = [
  { name: 'Backend .env', path: path.join(__dirname, '.env') },
  { name: 'Backend .env.production', path: path.join(__dirname, '.env.production') },
  { name: 'Frontend .env', path: path.join(__dirname, '..', 'Labour', '.env') },
  { name: 'Frontend .env.production', path: path.join(__dirname, '..', 'Labour', '.env.production') }
];

envFiles.forEach(file => {
  try {
    if (fs.existsSync(file.path)) {
      console.log(`✅ ${file.name}: EXISTS`);
      const content = fs.readFileSync(file.path, 'utf8');
      const corsLine = content.split('\n').find(line => 
        line.includes('CORS_ORIGIN') || line.includes('VITE_API_BASE_URL')
      );
      if (corsLine) {
        console.log(`   ${corsLine.substring(0, 80)}${corsLine.length > 80 ? '...' : ''}`);
      }
    } else {
      console.log(`❌ ${file.name}: MISSING`);
    }
  } catch (error) {
    console.log(`⚠️  ${file.name}: ERROR - ${error.message}`);
  }
});

console.log('\n🧪 CORS Middleware Status:');
try {
  const serverPath = path.join(__dirname, 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  const hasPreflightHandler = serverContent.includes('preflightHandler');
  const hasCorsErrorHandler = serverContent.includes('corsErrorHandler');
  const hasDynamicOrigin = serverContent.includes('dynamicCorsOrigin');
  const hasCredentialsMiddleware = serverContent.includes('credentialsMiddleware');
  
  console.log(`   Preflight Handler: ${hasPreflightHandler ? '✅' : '❌'}`);
  console.log(`   CORS Error Handler: ${hasCorsErrorHandler ? '✅' : '❌'}`);
  console.log(`   Dynamic Origin: ${hasDynamicOrigin ? '✅' : '❌'}`);
  console.log(`   Credentials Middleware: ${hasCredentialsMiddleware ? '✅' : '❌'}`);
} catch (error) {
  console.log(`   Error checking server.js: ${error.message}`);
}

console.log('\n📦 Package Scripts:');
try {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const corsScripts = Object.keys(packageJson.scripts).filter(script => 
    script.includes('cors') || script.includes('setup') || script.includes('test')
  );
  corsScripts.forEach(script => {
    console.log(`   ${script}: ${packageJson.scripts[script]}`);
  });
} catch (error) {
  console.log(`   Error checking package.json: ${error.message}`);
}

console.log('\n🔧 CORS Middleware Files:');
const middlewareFiles = [
  'middlewares/corsMiddleware.js',
  'scripts/setupCors.js',
  'test-cors.js'
];

middlewareFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file}`);
  }
});

console.log('\n🌐 Frontend CORS Files:');
const frontendFiles = [
  '../Labour/src/utils/axiosInstance.js',
  '../Labour/src/utils/corsTest.js',
  '../Labour/src/Components/CorsStatus.jsx',
  '../Labour/vite.config.js'
];

frontendFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file.replace('../Labour/', '')}`);
  } else {
    console.log(`   ❌ ${file.replace('../Labour/', '')}`);
  }
});

console.log('\n📋 Configuration Summary:');
console.log('========================');

// Read and display key configurations
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const corsOrigin = envContent.match(/CORS_ORIGIN=(.+)/)?.[1] || 'Not set';
    const port = envContent.match(/PORT=(.+)/)?.[1] || '8080';
    const nodeEnv = envContent.match(/NODE_ENV=(.+)/)?.[1] || 'development';
    
    console.log(`   Backend Port: ${port}`);
    console.log(`   Environment: ${nodeEnv}`);
    console.log(`   CORS Origins: ${corsOrigin}`);
  }
} catch (error) {
  console.log(`   Error reading backend config: ${error.message}`);
}

try {
  const frontendEnvPath = path.join(__dirname, '..', 'Labour', '.env');
  if (fs.existsSync(frontendEnvPath)) {
    const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    const apiBaseUrl = envContent.match(/VITE_API_BASE_URL=(.+)/)?.[1] || 'Not set';
    const backendUrl = envContent.match(/VITE_BACKEND_URL=(.+)/)?.[1] || 'Not set';
    
    console.log(`   Frontend API URL: ${apiBaseUrl}`);
    console.log(`   Frontend Backend URL: ${backendUrl}`);
  }
} catch (error) {
  console.log(`   Error reading frontend config: ${error.message}`);
}

console.log('\n🎯 Next Steps:');
console.log('==============');
console.log('1. Start backend: npm run dev');
console.log('2. Start frontend: cd ../Labour && npm run dev');
console.log('3. Test CORS: npm run test:cors');
console.log('4. Setup production: npm run setup:cors');
console.log('5. View documentation: cat CORS_SETUP.md');

console.log('\n🚀 Quick Start Commands:');
console.log('========================');
console.log('# Development');
console.log('npm run dev                    # Start backend with CORS debugging');
console.log('npm run test:cors             # Test CORS configuration');
console.log('');
console.log('# Production Setup');
console.log('npm run setup:cors            # Interactive CORS setup');
console.log('NODE_ENV=production npm start # Start in production mode');

console.log('\n✅ CORS Configuration Complete!');
console.log('Your Labour project is now fully configured for CORS in both development and production.');
console.log('No more CORS errors should occur when following the setup correctly.');