const express = require('express');
const path = require('path');
const { LRUCache } = require('lru-cache');
const router = express.Router();
const { statements } = require('../config');

// Cache for analytics queries
const analyticsCache = new LRUCache({ max: 50, ttl: 30 * 1000 });

// Optional basic authentication middleware
const basicAuth = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return next(); // No auth required if no password set
  }

  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Dashboard"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const credentials = Buffer.from(auth.slice(6), 'base64').toString().split(':');
  const password = credentials[1];

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  next();
};

// Apply basic auth to all admin routes
router.use(basicAuth);

// GET /admin - Serve admin dashboard
router.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
  } catch (error) {
    console.error('Error serving admin dashboard:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

// GET /admin/data - Get analytics summary
router.get('/data', (req, res) => {
  try {
    const { slot, limit = 100 } = req.query;

    const cacheKey = slot ? `detail:${slot}:${limit}` : 'summary';
    if (analyticsCache.has(cacheKey)) {
      return res.json(analyticsCache.get(cacheKey));
    }

    if (slot) {
      // Get specific slot data
      const data = statements.getAnalyticsDetail.all(slot, parseInt(limit));
      analyticsCache.set(cacheKey, data);
      res.json(data);
    } else {
      // Get summary data
      const data = statements.getAnalyticsSummary.all();
      analyticsCache.set(cacheKey, data);
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
router.get('/stats', (req, res) => {
  try {
    const cacheKey = 'stats';
    if (analyticsCache.has(cacheKey)) {
      return res.json(analyticsCache.get(cacheKey));
    }

    const stats = statements.getSlotStats.all();

    // Calculate totals
    const totals = stats.reduce((acc, slot) => ({
      impressions: acc.impressions + (slot.impressions || 0),
      clicks: acc.clicks + (slot.clicks || 0)
    }), { impressions: 0, clicks: 0 });

    totals.ctr = totals.impressions > 0
      ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
      : 0;

    const payload = {
      slots: stats,
      totals,
      timestamp: new Date().toISOString()
    };
    analyticsCache.set(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /admin/export - Export analytics data as CSV
router.get('/export', (req, res) => {
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
router.delete('/data', (req, res) => {
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
router.get('/health', (req, res) => {
  try {
    const { db } = require('../config');

    // Get database stats
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM analytics').get();
    const uniqueSlots = db.prepare('SELECT COUNT(DISTINCT slot) as count FROM analytics').get();
    const recentEvents = db.prepare(
      'SELECT COUNT(*) as count FROM analytics WHERE timestamp > datetime("now", "-1 hour")'
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

module.exports = router;
