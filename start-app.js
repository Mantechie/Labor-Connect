#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Labour Connect Application...\n');

// Function to start a process
function startProcess(command, args, cwd, name) {
  console.log(`📦 Starting ${name}...`);
  
  const process = spawn(command, args, {
    cwd: join(__dirname, cwd),
    stdio: 'inherit',
    shell: true
  });

  process.on('error', (error) => {
    console.error(`❌ Error starting ${name}:`, error.message);
  });

  process.on('close', (code) => {
    console.log(`\n🔴 ${name} stopped with code ${code}`);
  });

  return process;
}

// Start backend
const backend = startProcess('npm', ['run', 'dev'], 'backend', 'Backend Server');

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('\n⏳ Backend starting, waiting 3 seconds...\n');
  
  setTimeout(() => {
    const frontend = startProcess('npm', ['run', 'dev'], 'Labour', 'Frontend Application');
    
    console.log('\n✅ Both applications are starting...');
    console.log('🌐 Frontend will be available at: http://localhost:5173');
    console.log('🔧 Backend API will be available at: http://localhost:8080/api');
    console.log('\nPress Ctrl+C to stop both applications\n');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down applications...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });
    
  }, 3000);
  
}, 1000); 