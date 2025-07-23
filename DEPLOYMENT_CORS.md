# 🚀 Production CORS Deployment Guide

This guide ensures your Labour project is properly configured for production deployment with zero CORS issues.

## 📋 Pre-Deployment Checklist

### Backend Configuration
- [ ] Update `.env.production` with actual production domains
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL certificates
- [ ] Test CORS configuration with `npm run test:cors`
- [ ] Verify all environment variables are set

### Frontend Configuration
- [ ] Update `.env.production` with production API URLs
- [ ] Build the application with `npm run build`
- [ ] Test the build with `npm run preview`
- [ ] Verify all environment variables are accessible

## 🌐 Domain Configuration Examples

### Single Domain Setup
```bash
# Backend .env.production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
NODE_ENV=production

# Frontend .env.production
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_BACKEND_URL=https://yourdomain.com
```

### Multi-Domain Setup (CDN/Subdomains)
```bash
# Backend .env.production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com,https://cdn.yourdomain.com

# Frontend .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_BACKEND_URL=https://api.yourdomain.com
```

## 🔧 Server Configuration

### Nginx Configuration
```nginx
# Complete Nginx configuration with CORS
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers (handled by backend, but can be added here as backup)
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

        # Handle preflight
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

### Apache Configuration
```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Frontend
    DocumentRoot /path/to/frontend/build
    
    # API Proxy
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:8080/api/
    ProxyPassReverse /api/ http://localhost:8080/api/
    
    # CORS Headers
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    Header always set Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization"
    Header always set Access-Control-Allow-Credentials "true"
    
    # Handle preflight
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</VirtualHost>
```

## 🐳 Docker Configuration

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Use production environment
ENV NODE_ENV=production

EXPOSE 8080

CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
    volumes:
      - ./backend/.env.production:/app/.env

  frontend:
    build: ./Labour
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## 🧪 Testing Production CORS

### Automated Testing
```bash
# Backend CORS test
cd backend
NODE_ENV=production npm run test:cors

# Frontend build test
cd ../Labour
npm run build
npm run preview

# Integration test
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://yourdomain.com/api/health
```

### Manual Testing Checklist
- [ ] Test from production domain
- [ ] Test preflight requests (OPTIONS)
- [ ] Test authenticated requests
- [ ] Test file uploads
- [ ] Test WebSocket connections (if used)
- [ ] Test from different browsers
- [ ] Test from mobile devices

## 🚨 Troubleshooting Common Issues

### Issue: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Solution:**
1. Check backend CORS_ORIGIN includes your domain
2. Verify backend is running and accessible
3. Check reverse proxy configuration

### Issue: "CORS policy: The request client is not a secure context"
**Solution:**
1. Ensure HTTPS is properly configured
2. Check SSL certificate validity
3. Verify mixed content issues

### Issue: "CORS policy: Credentials flag is 'true', but the 'Access-Control-Allow-Origin' header is '*'"
**Solution:**
1. Set specific origins instead of wildcard
2. Ensure credentials: true in both frontend and backend
3. Check cookie SameSite settings

### Issue: Preflight requests failing
**Solution:**
1. Verify OPTIONS method is allowed
2. Check Access-Control-Allow-Headers includes all required headers
3. Ensure preflight handler is working

## 📊 Monitoring and Logging

### Backend Logging
```javascript
// Add to your backend for production monitoring
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log(`CORS Preflight: ${req.get('Origin')} -> ${req.path}`);
  }
  next();
});
```

### Frontend Error Tracking
```javascript
// Add to your frontend for error monitoring
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('CORS')) {
    console.error('CORS Error:', event.reason);
    // Send to error tracking service
  }
});
```

## 🔄 Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy with CORS Check

on:
  push:
    branches: [main]

jobs:
  test-cors:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Test Backend CORS
        run: |
          cd backend
          npm ci
          npm run test:cors
      
      - name: Build Frontend
        run: |
          cd Labour
          npm ci
          npm run build
      
      - name: Deploy
        run: |
          # Your deployment commands here
```

## 📞 Support

If you encounter CORS issues after following this guide:

1. Check the browser console for specific error messages
2. Use the CORS testing utilities provided
3. Verify your domain configuration
4. Test with curl commands
5. Check server logs for CORS-related messages

Remember: CORS is a browser security feature. Server-to-server requests don't have CORS restrictions.