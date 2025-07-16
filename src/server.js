const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
require('dotenv').config();

const adRoutes = require('./routes/ad');
const trackRoutes = require('./routes/track');
const adminRoutes = require('./routes/admin');

const app = express();

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

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const rateLimit = parseInt(process.env.RATE_LIMIT) || 100;
const requests = new Map();
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60000; // 1 minute

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

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Lite Ad Server running on port ${PORT}`);
    console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin`);
    console.log(`📈 Health check: http://localhost:${PORT}/health`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
}

module.exports = app;
