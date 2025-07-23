#!/usr/bin/env node

/**
 * CORS Setup Script for Production Deployment
 * This script helps configure CORS settings for different environments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

class CorsSetup {
  constructor() {
    this.envPath = path.join(__dirname, '..', '.env');
    this.envProdPath = path.join(__dirname, '..', '.env.production');
    this.frontendEnvPath = path.join(__dirname, '..', '..', 'Labour', '.env');
    this.frontendEnvProdPath = path.join(__dirname, '..', '..', 'Labour', '.env.production');
  }

  async setupDevelopment() {
    console.log('🔧 Setting up CORS for Development Environment...\n');

    const frontendPort = await question('Frontend port (default: 5173): ') || '5173';
    const backendPort = await question('Backend port (default: 8080): ') || '8080';
    
    const devOrigins = [
      `http://localhost:${frontendPort}`,
      `http://127.0.0.1:${frontendPort}`,
      `http://localhost:3000`, // Common React port
      `http://127.0.0.1:3000`
    ];

    console.log('\n📝 Development CORS Origins:');
    devOrigins.forEach(origin => console.log(`   - ${origin}`));

    // Update backend .env
    this.updateEnvFile(this.envPath, {
      'CORS_ORIGIN': devOrigins.join(','),
      'PORT': backendPort,
      'NODE_ENV': 'development'
    });

    // Update frontend .env
    this.updateEnvFile(this.frontendEnvPath, {
      'VITE_API_BASE_URL': '/api',
      'VITE_BACKEND_URL': `http://localhost:${backendPort}`,
      'VITE_NODE_ENV': 'development',
      'VITE_ENABLE_DEBUG': 'true',
      'VITE_SHOW_CONSOLE_LOGS': 'true'
    });

    console.log('\n✅ Development CORS configuration updated!');
  }

  async setupProduction() {
    console.log('🚀 Setting up CORS for Production Environment...\n');

    const domains = [];
    let addMore = true;

    console.log('Enter your production domains (press Enter after each, empty line to finish):');
    
    while (addMore) {
      const domain = await question('Domain (e.g., https://yourdomain.com): ');
      if (domain.trim()) {
        // Validate domain format
        if (domain.startsWith('http://') || domain.startsWith('https://')) {
          domains.push(domain.trim());
          
          // Add www variant if not present
          const wwwVariant = domain.includes('www.') 
            ? domain.replace('www.', '') 
            : domain.replace('://', '://www.');
          
          if (!domains.includes(wwwVariant)) {
            domains.push(wwwVariant);
          }
        } else {
          console.log('⚠️  Please include http:// or https:// in the domain');
        }
      } else {
        addMore = false;
      }
    }

    if (domains.length === 0) {
      console.log('❌ No domains provided. Using placeholder domains.');
      domains.push('https://your-production-domain.com', 'https://www.your-production-domain.com');
    }

    const backendPort = await question('Backend port (default: 8080): ') || '8080';

    console.log('\n📝 Production CORS Origins:');
    domains.forEach(domain => console.log(`   - ${domain}`));

    // Update backend .env.production
    this.updateEnvFile(this.envProdPath, {
      'CORS_ORIGIN': domains.join(','),
      'PORT': backendPort,
      'NODE_ENV': 'production',
      'CORS_CREDENTIALS': 'true',
      'CORS_MAX_AGE': '86400'
    });

    // Update frontend .env.production
    const primaryDomain = domains[0];
    this.updateEnvFile(this.frontendEnvProdPath, {
      'VITE_API_BASE_URL': `${primaryDomain}/api`,
      'VITE_BACKEND_URL': primaryDomain,
      'VITE_NODE_ENV': 'production',
      'VITE_ENABLE_DEBUG': 'false',
      'VITE_SHOW_CONSOLE_LOGS': 'false'
    });

    console.log('\n✅ Production CORS configuration updated!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update your production domains in the .env.production files');
    console.log('2. Configure your reverse proxy (Nginx/Apache) if needed');
    console.log('3. Ensure SSL certificates are properly configured');
    console.log('4. Test CORS configuration before deploying');
  }

  updateEnvFile(filePath, updates) {
    let content = '';
    
    // Read existing content if file exists
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    }

    // Update or add each key-value pair
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (regex.test(content)) {
        content = content.replace(regex, newLine);
      } else {
        content += content.endsWith('\n') ? '' : '\n';
        content += `${newLine}\n`;
      }
    });

    // Write updated content
    fs.writeFileSync(filePath, content);
    console.log(`   Updated: ${filePath}`);
  }

  async testCorsConfiguration() {
    console.log('🧪 Testing CORS Configuration...\n');

    try {
      // Import and run the existing CORS test
      const { default: testCors } = await import('../test-cors.js');
      await testCors();
    } catch (error) {
      console.error('❌ CORS test failed:', error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Ensure backend server is running');
      console.log('2. Check .env file configuration');
      console.log('3. Verify network connectivity');
    }
  }

  async generateNginxConfig() {
    console.log('🌐 Generating Nginx CORS Configuration...\n');

    const domain = await question('Your domain (e.g., yourdomain.com): ');
    const backendPort = await question('Backend port (default: 8080): ') || '8080';

    const nginxConfig = `
# Nginx CORS Configuration for ${domain}
server {
    listen 80;
    listen [::]:80;
    server_name ${domain} www.${domain};
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain} www.${domain};

    # SSL Configuration (update paths to your certificates)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Frontend (React build)
    location / {
        root /path/to/your/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # CORS headers for static files
        add_header 'Access-Control-Allow-Origin' 'https://${domain}' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    }

    # API Proxy to Backend
    location /api/ {
        proxy_pass http://localhost:${backendPort}/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://${domain}' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://${domain}';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}`;

    const configPath = path.join(__dirname, '..', 'nginx-cors.conf');
    fs.writeFileSync(configPath, nginxConfig);
    
    console.log(`✅ Nginx configuration saved to: ${configPath}`);
    console.log('\n📋 To use this configuration:');
    console.log('1. Copy the configuration to your Nginx sites-available directory');
    console.log('2. Update SSL certificate paths');
    console.log('3. Update frontend build path');
    console.log('4. Enable the site and reload Nginx');
  }

  async run() {
    console.log('🚀 CORS Configuration Setup Tool\n');
    console.log('This tool will help you configure CORS for development and production environments.\n');

    const choice = await question(
      'Choose an option:\n' +
      '1. Setup Development CORS\n' +
      '2. Setup Production CORS\n' +
      '3. Test CORS Configuration\n' +
      '4. Generate Nginx Configuration\n' +
      '5. Exit\n' +
      'Enter your choice (1-5): '
    );

    switch (choice) {
      case '1':
        await this.setupDevelopment();
        break;
      case '2':
        await this.setupProduction();
        break;
      case '3':
        await this.testCorsConfiguration();
        break;
      case '4':
        await this.generateNginxConfig();
        break;
      case '5':
        console.log('👋 Goodbye!');
        break;
      default:
        console.log('❌ Invalid choice. Please run the script again.');
    }

    rl.close();
  }
}

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new CorsSetup();
  setup.run().catch(console.error);
}

export default CorsSetup;