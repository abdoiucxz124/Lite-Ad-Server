const express = require('express');
const router = express.Router();
const { statements } = require('../config');
const AnalyticsEngine = require('../analytics-engine');

const validateEnhancedTrackingData = (data) => {
  if (!data.event || !data.slot) {
    return { valid: false, error: 'Event and slot are required' };
  }
  return { valid: true };
};

const updateRealTimeAggregates = () => ({ });
const triggerRevenueOptimization = () => {};
const getActiveOptimizations = () => [];

router.post('/', async (req, res) => {
  try {
    const { event, format, slot, adId, metadata = {}, revenue = 0, userId, sessionId, geo, device, abTestId, variant } = req.body;
    const validationResult = validateEnhancedTrackingData(req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ error: validationResult.error });
    }
    const trackingId = statements.enhancedTracking.insert.run(
      event, format, slot, adId, revenue, userId, sessionId,
      geo?.country, geo?.region, device?.type, device?.os,
      req.headers['user-agent'] || '', abTestId, variant,
      req.ip, req.headers['user-agent'] || '', req.headers.referer || '',
      req.body.pageUrl || '', req.body.viewportWidth || null,
      req.body.viewportHeight || null, JSON.stringify(metadata)
    );
    const aggregatedData = updateRealTimeAggregates(req.body);
    if (req.app.locals.io) {
      req.app.locals.io.emit('analytics-update', { event: req.body, aggregates: aggregatedData, timestamp: Date.now() });
    }
    if (revenue > 0) triggerRevenueOptimization(req.body);
    res.json({ success: true, trackingId, optimizations: getActiveOptimizations(slot, format) });
  } catch (error) {
    console.error('Enhanced tracking error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

router.get('/api/revenue-insights', (req, res) => {
  const engine = new AnalyticsEngine(statements);
  const insights = engine.generateRevenueInsights();
  res.json({ insights });
});

router.post('/api/ab-test', (req, res) => {
  const engine = new AnalyticsEngine(statements);
  const test = engine.createABTest(req.body);
  res.json({ test });
});

router.get('/api/ab-test/:id/results', (req, res) => {
  const engine = new AnalyticsEngine(statements);
  const results = engine.analyzeABTestResults(req.params.id);
  res.json({ results });
});

router.get('/pixel', (req, res) => {
  const pixel = Buffer.from([0x47,0x49,0x46,0x38,0x39,0x61,0x01,0x00,0x01,0x00,0x80,0x00,0x00,0xff,0xff,0xff,0x00,0x00,0x00,0x21,0xf9,0x04,0x01,0x00,0x00,0x00,0x00,0x2c,0x00,0x00,0x00,0x00,0x01,0x00,0x01,0x00,0x00,0x02,0x02,0x04,0x01,0x00,0x3b]);
  res.set({'Content-Type':'image/gif','Content-Length':pixel.length,'Cache-Control':'no-cache, no-store, must-revalidate'});
  res.send(pixel);
});

router.post('/batch', (req, res) => {
  const { events = [] } = req.body;
  const clientInfo = { ua: req.headers['user-agent'], ip: req.ip, referer: req.headers.referer };
  const results = [];
  events.slice(0,100).forEach(evt=>{
    if (evt.slot && evt.event) {
      try {
        statements.enhancedTracking.insert.run(
          evt.event, evt.format, evt.slot, evt.adId, evt.revenue || 0, evt.userId,
          evt.sessionId, null, null, null, null, clientInfo.ua, evt.abTestId,
          evt.variant, clientInfo.ip, clientInfo.ua, clientInfo.referer,
          evt.pageUrl || '', evt.viewportWidth || null, evt.viewportHeight || null,
          JSON.stringify(evt.metadata || {})
        );
        results.push(true);
      } catch { results.push(false); }
    } else { results.push(false); }
  });
  res.json({ success: true, processed: results.filter(Boolean).length });
});

module.exports = router;
