const express = require('express');
const router = express.Router();
const { statements } = require('../config');
const crypto = require('crypto');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

// Try to load AnalyticsEngine if available, otherwise use fallback functions
let AnalyticsEngine;
try {
  AnalyticsEngine = require('../analytics-engine');
} catch (error) {
  // Fallback for missing analytics engine
  AnalyticsEngine = class {
    constructor() { }
    generateRevenueInsights() { return { insights: 'Analytics engine not available' }; }
    createABTest(data) { return { test: data }; }
    analyzeABTestResults(id) { return { results: 'No results available' }; }
  };
}

const validateTrackingData = (data) => {
  if (!data.event || !data.slot) {
    return { valid: false, error: 'Event and slot are required' };
  }
  return { valid: true };
};

const validateEnhancedTrackingData = (data) => {
  if (!data.event || !data.slot) {
    return { valid: false, error: 'Event and slot are required' };
  }
  return { valid: true };
};

const extractClientInfo = (req) => {
  return {
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip || req.connection.remoteAddress,
    referer: req.headers.referer || '',
    timestamp: new Date().toISOString()
  };
};

const updateRealTimeAggregates = (data) => {
  // TODO: Implement real-time aggregation logic
  return {};
};

const triggerRevenueOptimization = (data) => {
  // TODO: Implement revenue optimization trigger
};

const getActiveOptimizations = (slot, format) => {
  // TODO: Implement active optimizations lookup
  return [];
};

const getSessionId = (req) => {
  return req.body.sessionId || req.headers['x-session-id'] || crypto.randomUUID();
};

const ensureSession = (req) => {
  const sessionId = getSessionId(req);
  const ua = new UAParser(req.headers['user-agent'] || '').getResult();
  const geo = geoip.lookup(req.ip) || {};
  const fingerprint = `${req.headers['user-agent'] || ''}-${req.ip}`;

  try {
    statements.insertSession.run(
      sessionId,
      fingerprint,
      req.ip,
      geo.country || '',
      ua.device.type || 'desktop',
      ua.browser.name || ''
    );
  } catch (err) {
    console.error('Failed to store session:', err);
  }
  return sessionId;
};

// POST /api/track - Track ad events (supports both simple and enhanced tracking)
router.post('/', async (req, res) => {
  try {
    const { event, format, slot, adId, metadata = {}, revenue = 0, userId, sessionId, geo, device, abTestId, variant } = req.body;

    // Validate the tracking data
    const validationResult = validateEnhancedTrackingData(req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ error: validationResult.error });
    }

    // Extract client information
    const clientInfo = extractClientInfo(req);
    const sessionIdToUse = ensureSession(req);

    try {
      // Basic tracking (always do this for compatibility)
      const result = statements.insertAnalytics.run(
        slot,
        event.toLowerCase(),
        clientInfo.userAgent,
        clientInfo.ip,
        clientInfo.referer
      );

      // Basic event tracking
      statements.insertEvent.run(
        sessionIdToUse,
        event.toLowerCase(),
        slot,
        revenue || 0,
        JSON.stringify(metadata || {})
      );

      // Enhanced tracking if enhanced data is provided
      if (statements.enhancedTracking && (format || adId || userId || geo || device || abTestId)) {
        statements.enhancedTracking.insert.run(
          event, format || 'standard', slot, adId, revenue, userId, sessionId || sessionIdToUse,
          geo?.country, geo?.region, device?.type, device?.os,
          clientInfo.userAgent, abTestId, variant,
          clientInfo.ip, clientInfo.userAgent, clientInfo.referer,
          req.body.pageUrl || '', req.body.viewportWidth || null,
          req.body.viewportHeight || null, JSON.stringify(metadata)
        );
      }

      console.log(`📊 Tracked ${event} for slot: ${slot} (ID: ${result.lastInsertRowid})`);

      // Real-time updates
      const aggregatedData = updateRealTimeAggregates(req.body);
      if (req.app.get('io')) {
        req.app.get('io').emit('analytics', { slot, event: event.toLowerCase() });
        req.app.get('io').emit('analytics-update', { event: req.body, aggregates: aggregatedData, timestamp: Date.now() });
      }

      // Revenue optimization
      if (revenue > 0) {
        triggerRevenueOptimization(req.body);
      }

      const payload = {
        success: true,
        id: result.lastInsertRowid,
        timestamp: clientInfo.timestamp,
        optimizations: getActiveOptimizations(slot, format)
      };

      res.json(payload);
    } catch (dbError) {
      console.error('Database error while tracking event:', dbError);
      res.status(500).json({
        error: 'Failed to save tracking data',
        message: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
  } catch (error) {
    console.error('Enhanced tracking error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

router.get('/api/revenue-insights', (req, res) => {
  try {
    const engine = new AnalyticsEngine(statements);
    const insights = engine.generateRevenueInsights();
    res.json({ insights });
  } catch (error) {
    console.error('Revenue insights error:', error);
    res.status(500).json({ error: 'Failed to get revenue insights' });
  }
});

router.post('/api/ab-test', (req, res) => {
  try {
    const engine = new AnalyticsEngine(statements);
    const test = engine.createABTest(req.body);
    res.json({ test });
  } catch (error) {
    console.error('AB test creation error:', error);
    res.status(500).json({ error: 'Failed to create AB test' });
  }
});

router.get('/api/ab-test/:id/results', (req, res) => {
  try {
    const engine = new AnalyticsEngine(statements);
    const results = engine.analyzeABTestResults(req.params.id);
    res.json({ results });
  } catch (error) {
    console.error('AB test results error:', error);
    res.status(500).json({ error: 'Failed to get AB test results' });
  }
});

router.get('/pixel', (req, res) => {
  try {
    const { slot } = req.query;

    if (slot) {
      const validation = validateTrackingData({ slot, event: 'impression' });
      if (validation.valid) {
        const clientInfo = extractClientInfo(req);

        try {
          statements.insertAnalytics.run(
            slot,
            'impression',
            clientInfo.userAgent,
            clientInfo.ip,
            clientInfo.referer
          );
          const sessionId = ensureSession(req);
          statements.insertEvent.run(sessionId, 'impression', slot, 0, '{}');
          console.log(`📊 Pixel tracked impression for slot: ${slot}`);
          if (req.app.get('io')) {
            req.app.get('io').emit('analytics', { slot, event: 'impression' });
          }
        } catch (dbError) {
          console.error('Database error in pixel tracking:', dbError);
        }
      }
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
      0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
      0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
      0x04, 0x01, 0x00, 0x3b
    ]);

    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0'
    });

    res.send(pixel);
  } catch (error) {
    console.error('Error in pixel tracking:', error);
    // Always return pixel even on error
    res.status(200).send(Buffer.alloc(1));
  }
});

router.post('/batch', (req, res) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Events array is required and must not be empty' });
    }

    if (events.length > 100) {
      return res.status(400).json({ error: 'Too many events. Maximum 100 events per batch' });
    }

    const clientInfo = extractClientInfo(req);
    const sessionId = ensureSession(req);
    const results = [];
    const errors = [];

    // Process each event
    for (let i = 0; i < events.length; i++) {
      const eventData = events[i];
      const validation = validateTrackingData(eventData);

      if (!validation.valid) {
        errors.push({ index: i, error: validation.error, event: eventData });
        continue;
      }

      try {
        // Basic tracking
        const result = statements.insertAnalytics.run(
          eventData.slot,
          eventData.event.toLowerCase(),
          clientInfo.userAgent,
          clientInfo.ip,
          clientInfo.referer
        );

        statements.insertEvent.run(
          sessionId,
          eventData.event.toLowerCase(),
          eventData.slot,
          eventData.revenue || 0,
          JSON.stringify(eventData.metadata || {})
        );

        // Enhanced tracking if available
        if (statements.enhancedTracking) {
          statements.enhancedTracking.insert.run(
            eventData.event, eventData.format || 'standard', eventData.slot,
            eventData.adId, eventData.revenue || 0, eventData.userId,
            eventData.sessionId || sessionId, null, null, null, null,
            clientInfo.userAgent, eventData.abTestId, eventData.variant,
            clientInfo.ip, clientInfo.userAgent, clientInfo.referer,
            eventData.pageUrl || '', eventData.viewportWidth || null,
            eventData.viewportHeight || null, JSON.stringify(eventData.metadata || {})
          );
        }

        results.push({
          index: i,
          id: result.lastInsertRowid,
          slot: eventData.slot,
          event: eventData.event
        });
      } catch (dbError) {
        errors.push({ index: i, error: dbError.message, event: eventData });
      }
    }

    console.log(`📊 Batch tracked ${results.length} events, ${errors.length} errors`);

    // Emit real-time updates
    if (req.app.get('io')) {
      results.forEach(r => req.app.get('io').emit('analytics', {
        slot: r.slot,
        event: events[r.index].event.toLowerCase()
      }));
    }

    res.json({
      success: true,
      processed: results.length,
      error_count: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: clientInfo.timestamp
    });
  } catch (error) {
    console.error('Error in batch tracking:', error);
    res.status(500).json({
      error: 'Batch tracking failed',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
