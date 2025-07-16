const express = require('express');
const router = express.Router();
const { statements } = require('../config');

// Validation helpers
const validateTrackingData = (data) => {
  const { slot, event } = data;

  if (!slot || typeof slot !== 'string') {
    return { valid: false, error: 'Slot parameter is required and must be a string' };
  }

  if (!event || typeof event !== 'string') {
    return { valid: false, error: 'Event parameter is required and must be a string' };
  }

  const allowedEvents = ['impression', 'click', 'viewable', 'loaded'];
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
    const { slot, event } = req.body;

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
        clientInfo.userAgent,
        clientInfo.ip,
        clientInfo.referer
      );

      if (req.app.locals.io) {
        req.app.locals.io.emit('analytics', {
          slot,
          event: event.toLowerCase(),
          timestamp: clientInfo.timestamp
        });
      }

      console.log(`📊 Tracked ${event} for slot: ${slot} (ID: ${result.lastInsertRowid})`);

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
            clientInfo.userAgent,
            clientInfo.ip,
            clientInfo.referer
          );
          if (req.app.locals.io) {
            req.app.locals.io.emit('analytics', {
              slot,
              event: 'impression',
              timestamp: clientInfo.timestamp
            });
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
          clientInfo.userAgent,
          clientInfo.ip,
          clientInfo.referer
        );

        if (req.app.locals.io) {
          req.app.locals.io.emit('analytics', {
            slot: eventData.slot,
            event: eventData.event.toLowerCase(),
            timestamp: clientInfo.timestamp
          });
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
