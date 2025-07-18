const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { metricsMiddleware, getMetrics } = require('./monitoring');

const adRoutes = require('./routes/ad');
const trackRoutes = require('./routes/track');
const adminRoutes = require('./routes/admin');

const app = express();

// Metrics middleware
if (process.env.ENABLE_METRICS === 'true') {
  app.use(metricsMiddleware);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://securepubads.g.doubleclick.net'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", 'https://googleads.g.doubleclick.net']
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const rateLimit = parseInt(process.env.RATE_LIMIT_REQUESTS || process.env.RATE_LIMIT || 100);
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const requests = new Map();
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!requests.has(ip)) {
    requests.set(ip, []);
  }

  const ipRequests = requests.get(ip);
  const recentRequests = ipRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= rateLimit) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  recentRequests.push(now);
  requests.set(ip, recentRequests);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version
  });
});

// Metrics endpoint on main server
if (process.env.ENABLE_METRICS === 'true' && process.env.METRICS_PORT === undefined) {
  app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.end(getMetrics());
  });
}

// API routes
app.use('/api/ad', adRoutes);
app.use('/api/track', trackRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

const PORT = process.env.PORT || 4000;

let server;
let metricsServer;

if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`🚀 Lite Ad Server running on port ${PORT}`);
    console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin`);
    console.log(`📈 Health check: http://localhost:${PORT}/health`);
  });

  if (process.env.ENABLE_METRICS === 'true' && process.env.METRICS_PORT) {
    const metricsApp = express();
    metricsApp.get('/metrics', (req, res) => {
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.end(getMetrics());
    });
    const metricsPort = parseInt(process.env.METRICS_PORT, 10) || 9090;
    metricsServer = metricsApp.listen(metricsPort, () => {
      console.log(`📈 Metrics server running on port ${metricsPort}`);
    });
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      if (metricsServer) {
        metricsServer.close();
      }
      console.log('Process terminated');
      process.exit(0);
    });
  });
}

module.exports = app;
