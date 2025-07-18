# Labor Connect Backend Deployment Guide

This guide covers deployment scenarios for the Labor Connect backend from local development to production.

## Table of Contents
1. [Local Development](#local-development)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- Git

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if not running)
sudo systemctl start mongod
# OR
mongod --dbpath /path/to/your/db

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
```

### Development Scripts
```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run seed        # Seed database with sample data
./start-dev.sh      # Interactive development setup
./test-api.sh       # Test API endpoints
```

---

## Environment Configuration

### Required Environment Variables

#### Database
```env
MONGO_URI=mongodb://localhost:27017/labor-connect
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/labor-connect
```

#### Authentication
```env
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
```

#### Server
```env
NODE_ENV=development
PORT=8080
FRONTEND_URL=http://localhost:3000
```

#### Email (Nodemailer)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
```

#### SMS (Twilio)
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

#### File Upload
```env
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### Environment-Specific Configurations

#### Development (.env.development)
```env
NODE_ENV=development
PORT=8080
MONGO_URI=mongodb://localhost:27017/labor-connect-dev
JWT_SECRET=dev-secret-key
FRONTEND_URL=http://localhost:3000
```

#### Staging (.env.staging)
```env
NODE_ENV=staging
PORT=8080
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/labor-connect-staging
JWT_SECRET=staging-secret-key
FRONTEND_URL=https://staging.laborconnect.com
```

#### Production (.env.production)
```env
NODE_ENV=production
PORT=8080
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/labor-connect
JWT_SECRET=production-super-secret-key
FRONTEND_URL=https://laborconnect.com
```

---

## Database Setup

### Local MongoDB
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt update
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
mongod --version
```

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update `MONGO_URI` in .env

### Database Seeding
```bash
# Seed with sample data
npm run seed

# Or manually
node utils/seeder.js seed
```

---

## Production Deployment

### Server Requirements
- Ubuntu 20.04 LTS or higher
- Node.js 18.x or higher
- MongoDB 6.0 or higher
- Nginx (reverse proxy)
- PM2 (process manager)
- SSL certificate

### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx
```

### Step 2: Application Deployment
```bash
# Clone repository
git clone <repository-url> /var/www/labor-connect-backend
cd /var/www/labor-connect-backend

# Install dependencies
npm install --production

# Create production environment file
cp .env.example .env
# Edit .env with production values

# Create uploads directory
mkdir -p uploads/{documents,images,videos}
sudo chown -R www-data:www-data uploads/

# Test the application
npm start
```

### Step 3: PM2 Configuration
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'labor-connect-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided

# Monitor application
pm2 monit
```

### Step 4: Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/labor-connect-backend

# Add the following configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/labor-connect-backend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: SSL Certificate
```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 6: Firewall Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

---

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/{documents,images,videos}

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/labor-connect
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongo_data:
```

### Docker Commands
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Scale backend service
docker-compose up -d --scale backend=3

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d
```

---

## Monitoring and Logging

### PM2 Monitoring
```bash
# View application status
pm2 status

# View logs
pm2 logs labor-connect-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart labor-connect-backend

# Reload without downtime
pm2 reload labor-connect-backend
```

### Log Management
```bash
# Rotate logs
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Health Checks
```bash
# Add health check endpoint to server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Monitoring Tools
- **PM2 Plus**: Advanced monitoring dashboard
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure and application monitoring
- **Prometheus + Grafana**: Open-source monitoring stack

---

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs labor-connect-backend

# Check port usage
sudo netstat -tulpn | grep :8080

# Check environment variables
pm2 env labor-connect-backend
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongo --eval 'db.runCommand("ping")'

# Check MongoDB logs
sudo journalctl -u mongod

# Test connection string
node -e "const mongoose = require('mongoose'); mongoose.connect('your-connection-string').then(() => console.log('Connected')).catch(err => console.error(err))"
```

#### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart labor-connect-backend

# Check for memory leaks
node --inspect server.js
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

### Performance Optimization

#### Database Indexing
```javascript
// Add indexes to frequently queried fields
db.users.createIndex({ email: 1 })
db.jobs.createIndex({ category: 1, location: 1 })
db.laborers.createIndex({ specialization: 1, rating: -1 })
```

#### Caching
```javascript
// Implement Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
app.get('/api/laborers', async (req, res) => {
  const cacheKey = 'laborers:all';
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const laborers = await Laborer.find();
  await client.setex(cacheKey, 300, JSON.stringify(laborers));
  res.json(laborers);
});
```

#### Load Balancing
```nginx
upstream backend {
    server 127.0.0.1:8080;
    server 127.0.0.1:8081;
    server 127.0.0.1:8082;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### Backup and Recovery

#### Database Backup
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/labor-connect" --out /backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/labor-connect" /backup/20240101/labor-connect
```

#### Automated Backup Script
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"
DB_NAME="labor-connect"

mkdir -p $BACKUP_DIR

# Create backup
mongodump --uri="mongodb://localhost:27017/$DB_NAME" --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$DATE.tar.gz"
```

---

## Security Checklist

- [ ] Environment variables secured
- [ ] JWT secret is strong and unique
- [ ] Database access restricted
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Firewall configured
- [ ] Regular security updates applied
- [ ] File upload restrictions in place
- [ ] Rate limiting implemented
- [ ] Input validation and sanitization
- [ ] Error messages don't expose sensitive data
- [ ] Logging configured for security events
- [ ] Backup and recovery procedures tested

---

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Contact the development team

For production support:
- Email: support@laborconnect.com
- Slack: #backend-support
- Emergency: +1-XXX-XXX-XXXX