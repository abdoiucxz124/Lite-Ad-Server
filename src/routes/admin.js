const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const router = express.Router();
const { statements } = require('../config');

function requireAuth (req, res, next) {
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminHash) return next();
  if (req.session && req.session.authenticated) return next();
  return res.status(401).json({ error: 'Authentication required' });
}

router.post('/login', async (req, res) => {
  try {
    const { username, password, token } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    if (!adminHash) {
      return res.status(403).json({ error: 'Admin login disabled' });
    }
    const validPassword = await bcrypt.compare(password || '', adminHash);
    if (!validPassword || username !== adminUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (process.env.ADMIN_TOTP_SECRET) {
      const verified = speakeasy.totp.verify({
        secret: process.env.ADMIN_TOTP_SECRET,
        encoding: 'base32',
        token
      });
      if (!verified) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    req.session.authenticated = true;
    res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  if (req.session) req.session.destroy(() => {});
  res.json({ success: true });
});

router.use(requireAuth);

router.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
  } catch (error) {
    console.error('Error serving admin dashboard:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

router.get('/data', (req, res) => {
  try {
    const { slot, limit = 100 } = req.query;
    if (slot) {
      const data = statements.getAnalyticsDetail.all(slot, parseInt(limit));
      res.json(data);
    } else {
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

router.get('/stats', (req, res) => {
  try {
    const stats = statements.getSlotStats.all();
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

router.get('/export', (req, res) => {
  try {
    const { format = 'csv', slot } = req.query;
    let data;
    if (slot) {
      data = statements.getAnalyticsDetail.all(slot, 10000);
    } else {
      const { db } = require('../config');
      data = db.prepare('SELECT * FROM analytics ORDER BY timestamp DESC LIMIT 10000').all();
    }
    if (format.toLowerCase() === 'csv') {
      const headers = ['id', 'slot', 'event', 'ua', 'ip', 'referer', 'timestamp'];
      const csvRows = [headers.join(',')];
      /* eslint-disable security/detect-object-injection */
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        });
        csvRows.push(values.join(','));
      });
      /* eslint-enable security/detect-object-injection */
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

router.get('/health', (req, res) => {
  try {
    const { db } = require('../config');
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
