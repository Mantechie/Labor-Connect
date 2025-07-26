import express from 'express';
import mongoose from 'mongoose';
import { logger } from '../utils/Logger.js';
import os from 'os';

const router = express.Router();

// Basic health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    service: 'labour-api'
  });
});

// Detailed health check with system info
router.get('/health/detailed', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const health = {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    service: 'labour-api',
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbState === 1 ? 'connected' : 'error',
      state: dbStates[dbState] || 'unknown'
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memory: {
        total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
        free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        usage: `${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%`
      },
      cpu: os.cpus().length,
      loadAvg: os.loadavg()
    }
  };
  
  // Log health check
  logger.info('Health check performed', { health });
  
  res.json(health);
});

// Database health check
router.get('/health/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (dbState !== 1) {
      return res.status(503).json({
        status: 'error',
        database: states[dbState] || 'unknown',
        message: 'Database connection is not established'
      });
    }
    
    // Perform a simple query to verify database is responsive
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const responseTime = Date.now() - startTime;
    
    res.json({
      status: 'ok',
      database: 'connected',
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    
    res.status(503).json({
      status: 'error',
      message: 'Database health check failed',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

export default router;
