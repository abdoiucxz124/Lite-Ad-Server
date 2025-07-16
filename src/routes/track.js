const express = require('express');
const router = express.Router();
const { statements } = require('../config');

// In-memory aggregation of events per minute
const aggregates = new Map();

const updateAggregates = (event, timestamp) => {
  const minute = timestamp.slice(0, 16); // YYYY-MM-DDTHH:MM
  if (!aggregates.has(minute)) {
    aggregates.set(minute, { impressions: 0, clicks: 0 });
    // keep only last 60 minutes
    const keys = Array.from(aggregates.keys()).sort();
    if (keys.length > 60) {
      for (const k of keys.slice(0, keys.length - 60)) aggregates.delete(k);
    }
  }

  const counts = aggregates.get(minute);
  if (event === 'impression') counts.impressions++;
  if (event === 'click') counts.clicks++;
};

const getAggregates = () => {
  return Array.from(aggregates.entries()).map(([minute, counts]) => ({
    minute,
    ...counts
  }));
};

// Validation helpers
const validateTrackingData = (data) => {
  const { slot, event } = data;

  if (!slot || typeof slot !== 'string') {
    return { valid: false, error: 'Slot parameter is required and must be a string' };
  }

  if (!event || typeof event !== 'string') {
    return { valid: false, error: 'Event parameter is required and must be a string' };
  }

  const allowedEvents = ['impression', 'click', 'viewable', 'loaded', 'expand', 'close', 'skip'];
  if (!allowedEvents.includes(event.toLowerCase())) {
    return { valid: false, error: `Event must be one of: ${allowedEvents.join(', ')}` };
  }

  return { valid: true };
};

// Extract client information
const extractClientInfo = (req) => {
  return {
    ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown',
    userAgent: req.headers['user-agent'] || '',
    referer: req.headers.referer || req.headers.referrer || '',
    timestamp: new Date().toISOString()
  };
};

// POST /api/track - Track ad events
router.post('/', (req, res) => {
  try {
    const { slot, event, format, metadata } = req.body;

    // Validate input data
    const validation = validateTrackingData({ slot, event });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Extract client information
    const clientInfo = extractClientInfo(req);

    // Insert tracking data
    try {
      const result = statements.insertAnalytics.run(
        slot,
        event.toLowerCase(),
        format || null,
        clientInfo.userAgent,
        clientInfo.ip,
        clientInfo.referer,
        metadata ? JSON.stringify(metadata) : null
      );

      if (req.app.locals.io) {
        req.app.locals.io.emit('analytics', {
          slot,
          event: event.toLowerCase(),
          timestamp: clientInfo.timestamp
        });
      }

      console.log(`📊 Tracked ${event} for slot: ${slot} (ID: ${result.lastInsertRowid})`);

      updateAggregates(event.toLowerCase(), clientInfo.timestamp);
      const io = req.app.locals.io;
      if (io) {
        io.emit('analytics', { event: event.toLowerCase(), slot, timestamp: clientInfo.timestamp });
        io.emit('aggregate', getAggregates().slice(-1)[0]);
      }

      res.json({
        success: true,
        id: result.lastInsertRowid,
        timestamp: clientInfo.timestamp
      });
    } catch (dbError) {
      console.error('Database error while tracking event:', dbError);
      res.status(500).json({
        error: 'Failed to save tracking data',
        message: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
  } catch (error) {
    console.error('Error in tracking route:', error);
    res.status(500).json({
      error: 'Internal tracking error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/track/pixel - 1x1 tracking pixel for impression tracking
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
            null,
            clientInfo.userAgent,
            clientInfo.ip,
            clientInfo.referer,
            null
          );
<<<<<<< HEAD
          updateAggregates('impression', clientInfo.timestamp);
          const io = req.app.locals.io;
          if (io) {
            io.emit('analytics', { event: 'impression', slot, timestamp: clientInfo.timestamp });
            io.emit('aggregate', getAggregates().slice(-1)[0]);
=======
          if (req.app.locals.io) {
            req.app.locals.io.emit('analytics', {
              slot,
              event: 'impression',
              timestamp: clientInfo.timestamp
            });
>>>>>>> origin/codex/transform-admin-dashboard-into-ad-management-platform
          }
          console.log(`📊 Pixel tracked impression for slot: ${slot}`);
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

// POST /api/track/batch - Batch tracking for multiple events
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
        const result = statements.insertAnalytics.run(
          eventData.slot,
          eventData.event.toLowerCase(),
          eventData.format || null,
          clientInfo.userAgent,
          clientInfo.ip,
          clientInfo.referer,
          eventData.metadata ? JSON.stringify(eventData.metadata) : null
        );

<<<<<<< HEAD
        updateAggregates(eventData.event.toLowerCase(), clientInfo.timestamp);
        const io = req.app.locals.io;
        if (io) {
          io.emit('analytics', { event: eventData.event.toLowerCase(), slot: eventData.slot, timestamp: clientInfo.timestamp });
=======
        if (req.app.locals.io) {
          req.app.locals.io.emit('analytics', {
            slot: eventData.slot,
            event: eventData.event.toLowerCase(),
            timestamp: clientInfo.timestamp
          });
>>>>>>> origin/codex/transform-admin-dashboard-into-ad-management-platform
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
    const io = req.app.locals.io;
    if (io) {
      io.emit('aggregate', getAggregates().slice(-1)[0]);
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
module.exports.getAggregates = getAggregates;
