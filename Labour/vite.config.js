/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external connections
    cors: true, // Enable CORS for dev server
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🚫 Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxying request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
          });
        },
        // Additional headers for CORS compatibility
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        }
      }
    }
  },
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  build: {
    sourcemap: true, // Enable source maps for debugging
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          react: ['react', 'react-dom'],
          // UI Framework
          bootstrap: ['react-bootstrap', 'bootstrap'],
          // Routing
          router: ['react-router-dom'],
          // Charts and icons
          charts: ['recharts'],
          icons: ['react-icons'],
          // HTTP client
          http: ['axios']
        }
      }
    }
  },
  define: {
    // Make environment variables available at build time
    // eslint-disable-next-line no-undef
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:8080'),
    // Enable process.env access in the browser
    'process.env': {}
  }
});
