# Complete CORS Configuration Guide for Labour Project

This comprehensive guide provides a bulletproof CORS setup for your Labour project, ensuring zero CORS errors in development, staging, and production environments.

## 🚀 Quick Start

### Development Setup
```bash
# Backend
cd backend
npm run setup:cors  # Interactive CORS setup
npm run test:cors   # Test CORS configuration
npm run dev         # Start with CORS debugging

# Frontend
cd ../Labour
npm run dev         # Start with proxy configuration
```

### Production Setup
```bash
# Backend
cd backend
NODE_ENV=production npm run setup:cors
NODE_ENV=production npm start

# Frontend
cd ../Labour
npm run build
npm run preview
```

---

## 1. Backend (Node.js + Express): CORS & Preflight-Proof Setup

### Step 1: Install `cors` package

```bash
npm install cors
```

### Step 2: Setup CORS in `server.js` or `app.js`

Add this setup at the top of your server file:

```js
import express from 'express';
import cors from 'cors';

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://your-production-domain.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Not Allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Handle Preflight (OPTIONS) requests globally
app.options('*', cors());

// JSON parser
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('CORS Configured Backend');
});
```

---

## 2. Frontend (React + Vite): Global Proxy and Axios Config

### Step 1: `vite.config.js`

Configure proxy to backend API:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // or your production backend URL
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
});
```

### Step 2: Axios Global Config (`axiosInstance.js`)

```js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send cookies/tokens
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
```

---

## 3. Cookies/Sessions (If Used) – Ensure Secure Usage

If your backend sets cookies or tokens:

- Use `credentials: true` in both frontend and backend.
- Set these headers on the backend:

```js
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
```

---

## 4. Production Notes

- Replace `localhost:5173` with your frontend production domain.
- Always use HTTPS in production.
- Use reverse proxy (Nginx, Vercel config) if deploying frontend and backend separately.

---

## 5. Testing CORS

After setup, you should never get:

- `CORS policy block`
- `Preflight OPTIONS error`
- `Missing Access-Control-Allow-Origin`

---

This setup ensures your entire website is fully CORS-configured, works in development and production, and avoids common CORS pitfalls.
