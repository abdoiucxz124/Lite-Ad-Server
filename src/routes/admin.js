const express = require('express');
const path = require('path');
const router = express.Router();
const { statements } = require('../config');
const AnalyticsEngine = require('../analytics-engine');

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

// -----------------------
// Format Management
// -----------------------
router.get('/api/formats', (req, res) => {
  try {
    const formats = statements.getFormats.all();
    res.json(formats.map(f => ({
      ...f,
      default_settings: f.default_settings ? JSON.parse(f.default_settings) : {}
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load formats' });
  }
});

router.post('/api/formats', (req, res) => {
  try {
    const { name, display_name: displayName, description, default_settings: defaultSettings } = req.body;
    if (!name || !displayName) {
      return res.status(400).json({ error: 'name and display_name required' });
    }
    statements.insertFormat.run({
      name,
      display_name: displayName,
      description,
      default_settings: JSON.stringify(defaultSettings || {})
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create format' });
  }
});

// -----------------------
// Campaign Management
// -----------------------
router.post('/api/campaigns', (req, res) => {
  try {
    const { name, format_id: formatId } = req.body;
    if (!name || !formatId) {
      return res.status(400).json({ error: 'name and format_id required' });
    }
    const result = statements.insertCampaign.run(
      name,
      formatId,
      req.body.status || 'draft',
      req.body.start_date || null,
      req.body.end_date || null,
      JSON.stringify(req.body.targeting || {}),
      JSON.stringify(req.body.settings || {})
    );
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.get('/api/campaigns', (req, res) => {
  try {
    const campaigns = statements.getCampaigns.all();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list campaigns' });
  }
});

router.put('/api/campaigns/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = statements.getCampaignById.get(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    statements.updateCampaign.run({
      id,
      name: req.body.name || existing.name,
      format_id: req.body.format_id || existing.format_id,
      targeting_settings: JSON.stringify(req.body.targeting_settings || existing.targeting_settings || {}),
      schedule_settings: JSON.stringify(req.body.schedule_settings || existing.schedule_settings || {}),
      budget_settings: JSON.stringify(req.body.budget_settings || existing.budget_settings || {}),
      status: req.body.status || existing.status
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

router.delete('/api/campaigns/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    statements.deleteCampaign.run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// -----------------------
// Creative Management
// -----------------------
router.post('/api/creatives', (req, res) => {
  try {
    const { campaign_id: campaignId, name, creative_data: creativeData, preview_url: previewUrl } = req.body;
    if (!campaignId || !name) {
      return res.status(400).json({ error: 'campaign_id and name required' });
    }
    const result = statements.insertCreative.run({
      campaign_id: campaignId,
      name,
      creative_data: JSON.stringify(creativeData || {}),
      preview_url: previewUrl,
      status: 'pending'
    });
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create creative' });
  }
});

router.get('/api/creatives/:id/preview', (req, res) => {
  try {
    const creative = statements.getCreative.get(req.params.id);
    if (!creative) return res.status(404).json({ error: 'Not found' });
    res.json({
      id: creative.id,
      creative_data: creative.creative_data ? JSON.parse(creative.creative_data) : {},
      preview_url: creative.preview_url
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to preview creative' });
  }
});

router.post('/api/creatives/:id/publish', (req, res) => {
  try {
    statements.updateCreativeStatus.run({ id: req.params.id, status: 'published' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish creative' });
  }
});

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
    const { slot, session, limit = 100 } = req.query;

    if (session) {
      const { db } = require('../config');
      const data = db.prepare('SELECT * FROM events WHERE session_id = ? ORDER BY created_at DESC LIMIT ?').all(session, parseInt(limit));
      res.json(data);
    } else if (slot) {
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
router.get('/stats', (req, res) => {
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

// Tag Generation API Endpoints
router.get('/api/tag-generator', (req, res) => {
  res.json({ message: 'Tag generator interface' });
});

router.post('/api/generate-tag', (req, res) => {
  try {
    const { format, size, placement, targeting, scheduling, frequency, siteId } = req.body;

    const tagConfig = {
      format,
      size,
      placement,
      targeting,
      scheduling,
      frequency,
      fallback: req.body.fallback || null,
      siteId
    };

    const universalTag = generateUniversalTag(tagConfig);
    res.json({ tag: universalTag, config: tagConfig });
  } catch (error) {
    console.error('Error generating tag:', error);
    res.status(500).json({ error: 'Failed to generate tag' });
  }
});

function generateUniversalTag(config) {
  return `\n<!-- Lite Ad Server Universal Tag -->\n<div class="lite-ad-container" \n     data-lite-ad\n     data-format="${config.format}"\n     data-size="${config.size}"\n     data-placement="${config.placement}"\n     data-targeting='${JSON.stringify(config.targeting)}'\n     data-scheduling='${JSON.stringify(config.scheduling)}'\n     data-frequency='${JSON.stringify(config.frequency)}'>\n  <script>\n    (function() {\n      window.LiteAdConfig = window.LiteAdConfig || {\n        apiEndpoint: '${process.env.API_ENDPOINT || 'http://localhost:3000'}',\n        siteId: '${config.siteId}',\n        debug: false\n      };\n      if (!window.LiteAdSDK) {\n        var script = document.createElement('script');\n        script.src = '${process.env.API_ENDPOINT || 'http://localhost:3000'}/ad-sdk.js';\n        script.async = true;\n        document.head.appendChild(script);\n      } else {\n        window.LiteAdSDK.loadAd(document.currentScript.parentElement);\n      }\n    })();\n  </script>\n</div>\n<!-- End Lite Ad Server Tag -->\n  `;
}

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
      "SELECT COUNT(*) as count FROM analytics WHERE timestamp > datetime('now', '-1 hour')"
    ).get();
    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
    const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        total_events: totalEvents.count,
        unique_slots: uniqueSlots.count,
        recent_events_1h: recentEvents.count,
        sessions: sessionCount.count,
        events: eventCount.count
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

// Advanced analytics API

router.get('/api/analytics-dashboard', (req, res) => {
  const engine = new AnalyticsEngine(statements);
  const stats = { totalRevenue: 0, avgCPM: 0, fillRate: 0, totalImpressions: 0, revenueChange: 0, cpmChange: 0, fillRateChange: 0, impressionsChange: 0 };
  const charts = { revenue: { labels: [], data: [] }, formats: { labels: [], data: [] } };
  res.json({ stats, charts });
});

router.get('/api/revenue-insights', (req, res) => {
  const engine = new AnalyticsEngine(statements);
  res.json({ insights: engine.generateRevenueInsights() });
});

router.post('/api/ab-test', (req, res) => {
  const engine = new AnalyticsEngine(statements);
  res.json({ test: engine.createABTest(req.body) });
});

router.get('/api/ab-test/:id/results', (req, res) => {
  const engine = new AnalyticsEngine(statements);
  res.json({ results: engine.analyzeABTestResults(req.params.id) });
});

module.exports = router;
