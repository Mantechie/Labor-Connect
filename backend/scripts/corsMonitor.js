import fetch from 'node-fetch';
import { logger, corsLogger } from '../utils/Logger.js';
import config from '../config/env.js';

/**
 * CORS Monitoring Tool
 * Tests CORS configuration against various endpoints and origins
 */
async function monitorCors() {
  console.log('🔍 Starting CORS Monitoring...');
  
  // Get allowed origins from config
  const allowedOrigins = config.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);
  
  // Add some invalid origins for testing
  const invalidOrigins = [
    'https://malicious-site.com',
    'http://invalid-domain.com',
    'https://attacker.evil'
  ];
  
  // Endpoints to test
  const endpoints = [
    '/api/health',
    '/api/cors-test',
    '/api/auth/login',
    '/api/users'
  ];
  
  // Test valid origins
  console.log('\n🟢 Testing Valid Origins:');
  for (const origin of allowedOrigins) {
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${origin} -> ${endpoint}`);
        
        // Test preflight OPTIONS request
        const optionsResponse = await fetch(`http://localhost:${config.PORT}${endpoint}`, {
          method: 'OPTIONS',
          headers: {
            'Origin': origin,
            'Access-Control-Request-Method': 'GET',
          },
        });
        
        console.log(`  OPTIONS: ${optionsResponse.status} ${optionsResponse.statusText}`);
        console.log(`  Access-Control-Allow-Origin: ${optionsResponse.headers.get('access-control-allow-origin')}`);
        
        // Test actual GET request
        const getResponse = await fetch(`http://localhost:${config.PORT}${endpoint}`, {
          method: 'GET',
          headers: {
            'Origin': origin,
          },
        });
        
        console.log(`  GET: ${getResponse.status} ${getResponse.statusText}`);
        console.log(`  Access-Control-Allow-Origin: ${getResponse.headers.get('access-control-allow-origin')}`);
        
        // Log success
        corsLogger.metrics(
          origin, 
          endpoint, 
          'GET', 
          getResponse.status, 
          0, 
          { 
            test: true,
            allowOrigin: getResponse.headers.get('access-control-allow-origin')
          }
        );
      } catch (error) {
        console.error(`  Error testing ${origin} -> ${endpoint}: ${error.message}`);
        corsLogger.error(origin, endpoint, 'GET', 'localhost', 'CORS Monitor', error.message);
      }
    }
  }
  
  // Test invalid origins
  console.log('\n🔴 Testing Invalid Origins:');
  for (const origin of invalidOrigins) {
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${origin} -> ${endpoint}`);
        
        // Test preflight OPTIONS request
        const optionsResponse = await fetch(`http://localhost:${config.PORT}${endpoint}`, {
          method: 'OPTIONS',
          headers: {
            'Origin': origin,
            'Access-Control-Request-Method': 'GET',
          },
        });
        
        console.log(`  OPTIONS: ${optionsResponse.status} ${optionsResponse.statusText}`);
        console.log(`  Access-Control-Allow-Origin: ${optionsResponse.headers.get('access-control-allow-origin')}`);
        
        // Test actual GET request
        const getResponse = await fetch(`http://localhost:${config.PORT}${endpoint}`, {
          method: 'GET',
          headers: {
            'Origin': origin,
          },
        });
        
        console.log(`  GET: ${getResponse.status} ${getResponse.statusText}`);
        console.log(`  Access-Control-Allow-Origin: ${getResponse.headers.get('access-control-allow-origin')}`);
        
        // Log results
        corsLogger.metrics(
          origin, 
          endpoint, 
          'GET', 
          getResponse.status, 
          0, 
          { 
            test: true,
            allowOrigin: getResponse.headers.get('access-control-allow-origin')
          }
        );
      } catch (error) {
        console.error(`  Error testing ${origin} -> ${endpoint}: ${error.message}`);
        corsLogger.error(origin, endpoint, 'GET', 'localhost', 'CORS Monitor', error.message);
      }
    }
  }
  
  console.log('\n✅ CORS Monitoring Complete');
  console.log('Check logs for detailed results');
}

// Run the monitor if executed directly
if (process.argv[1].endsWith('corsMonitor.js')) {
  monitorCors().catch(console.error);
}

export default monitorCors;
