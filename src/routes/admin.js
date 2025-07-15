const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');

const adminRouter = express.Router();
const authRouter = express.Router();
const { statements } = require('../config');

const jwtSecret = process.env.JWT_SECRET || 'secret';
const adminUser = process.env.ADMIN_USERNAME;
const adminPass = process.env.ADMIN_PASSWORD;

// POST /api/auth/login - Authenticate admin and return JWT
authRouter.post('/login', (req, res) => {
  try {
    if (!adminUser || !adminPass) {
      return res.status(500).json({ error: 'Admin credentials not configured' });
    }

    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, jwtSecret, { expiresIn: '24h' });
    res.json({ token, expires_in: 86400 });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// JWT authentication middleware
const requireAuth = (req, res, next) => {
  if (!adminUser || !adminPass) {
    return next(); // No auth required if credentials not set
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = auth.split(' ')[1];

  try {
    jwt.verify(token, jwtSecret);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Apply JWT auth to all admin routes
adminRouter.use(requireAuth);

// GET /admin - Serve admin dashboard
adminRouter.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
  } catch (error) {
    console.error('Error serving admin dashboard:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

// GET /admin/data - Get analytics summary
adminRouter.get('/data', (req, res) => {
  try {
    const { slot, limit = 100 } = req.query;

    if (slot) {
      // Get specific slot data
      const data = statements.getAnalyticsDetail.all(slot, parseInt(limit));
      res.json(data);
    } else {
      // Get summary data
      const data = statements.getAnalyticsSummary.all();
      res.json(data);
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics data',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /admin/stats - Get enhanced statistics
adminRouter.get('/stats', (req, res) => {
  try {
    const stats = statements.getSlotStats.all();

    // Calculate totals
    const totals = stats.reduce((acc, slot) => ({
      impressions: acc.impressions + (slot.impressions || 0),
      clicks: acc.clicks + (slot.clicks || 0)
    }), { impressions: 0, clicks: 0 });

    totals.ctr = totals.impressions > 0
      ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
      : 0;

    res.json({
      slots: stats,
      totals,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /admin/export - Export analytics data as CSV
adminRouter.get('/export', (req, res) => {
  try {
    const { format = 'csv', slot } = req.query;

    let data;
    if (slot) {
      data = statements.getAnalyticsDetail.all(slot, 10000);
    } else {
      // Get all data for export
      const { db } = require('../config');
      data = db.prepare('SELECT * FROM analytics ORDER BY timestamp DESC LIMIT 10000').all();
    }

    if (format.toLowerCase() === 'csv') {
      // Generate CSV
      const headers = ['id', 'slot', 'event', 'ua', 'ip', 'referer', 'timestamp'];
      const csvRows = [headers.join(',')];

      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        });
        csvRows.push(values.join(','));
      });

      const csv = csvRows.join('\n');
      const filename = `analytics_${slot || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      });

      res.send(csv);
    } else if (format.toLowerCase() === 'json') {
      const filename = `analytics_${slot || 'all'}_${new Date().toISOString().split('T')[0]}.json`;

      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      });

      res.json({
        exported_at: new Date().toISOString(),
        slot: slot || 'all',
        count: data.length,
        data
      });
    } else {
      res.status(400).json({ error: 'Unsupported format. Use csv or json' });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      error: 'Failed to export data',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /admin/data - Clean old analytics data
adminRouter.delete('/data', (req, res) => {
  try {
    const { days = 30 } = req.body;

    if (days < 1 || days > 365) {
      return res.status(400).json({ error: 'Days must be between 1 and 365' });
    }

    const { db } = require('../config');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = db.prepare(
      'DELETE FROM analytics WHERE timestamp < ?'
    ).run(cutoffDate.toISOString());

    console.log(`🗑️  Cleaned ${result.changes} analytics records older than ${days} days`);

    res.json({
      success: true,
      deleted: result.changes,
      cutoff_date: cutoffDate.toISOString()
    });
  } catch (error) {
    console.error('Error cleaning analytics data:', error);
    res.status(500).json({
      error: 'Failed to clean data',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /admin/health - Admin health check with database stats
adminRouter.get('/health', (req, res) => {
  try {
    const { db } = require('../config');

    // Get database stats
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM analytics').get();
    const uniqueSlots = db.prepare('SELECT COUNT(DISTINCT slot) as count FROM analytics').get();
    const recentEvents = db.prepare(
      "SELECT COUNT(*) as count FROM analytics WHERE timestamp > datetime('now', '-1 hour')"
    ).get();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        total_events: totalEvents.count,
        unique_slots: uniqueSlots.count,
        recent_events_1h: recentEvents.count
      },
      version: require('../../package.json').version
    });
  } catch (error) {
    console.error('Error in admin health check:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = { adminRouter, authRouter };
