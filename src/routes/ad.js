const express = require('express');
const router = express.Router();

// Validation helper
const validateSlot = (slot) => {
  if (!slot || typeof slot !== 'string') {
    return { valid: false, error: 'Slot parameter is required and must be a string' };
  }

  // Basic slot path validation (network_id/ad_unit_path)
  if (!/^[\w\-/]+$/.test(slot)) {
    return { valid: false, error: 'Invalid slot format. Use format: network_id/ad_unit_path' };
  }

  return { valid: true };
};

// Generate Google Ad Manager tag
const generateAdTag = (slot, networkId) => {
  const cleanSlot = slot.replace(/[^a-zA-Z0-9\-_/]/g, '');
  const slotId = `gpt-${cleanSlot.replace(/[/]/g, '-')}`;

  return `
    <!-- Google Ad Manager - Slot: ${cleanSlot} -->
    <div id="${slotId}">
      <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
      <script>
        window.googletag = window.googletag || {cmd: []};
        googletag.cmd.push(function() {
          const slot = googletag.defineSlot('/${networkId}/${cleanSlot}', 
            [[300,250], [300,600], [728,90], [320,50], [970,250], 'fluid'], 
            '${slotId}'
          );
          
          if (slot) {
            slot.addService(googletag.pubads());
            googletag.enableServices();
            googletag.display('${slotId}');
          } else {
            console.error('Failed to define ad slot: ${cleanSlot}');
          }
        });
      </script>
    </div>`;
};

// Generate advanced ad tag with dynamic loader
const generateAdvancedAdTag = (config) => {
  return `
    <div class="lite-ad-container" 
         data-format="${config.format}"
         data-slot="${config.slot}"
         data-size="${config.size || ''}"
         data-targeting='${JSON.stringify(config.targeting || {})}'>
      <script>
        (function() {
          window.LiteAdServer = window.LiteAdServer || {};
          window.LiteAdServer.loadAd(${JSON.stringify(config)});
        })();
      </script>
    </div>
  `;
};

// GET /api/ad - Serve ad tags
router.get('/', (req, res) => {
  try {
    const { slot, format, size, targeting, delay, position, allowSkip, response } = req.query;

    // Validate slot parameter
    const validation = validateSlot(slot);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Get network ID from environment or extract from slot
    const networkId = process.env.GAM_NETWORK_ID || slot.split('/')[0] || '22904833613';

    const config = {
      format: format || 'pushdown',
      slot,
      size,
      targeting: targeting ? JSON.parse(targeting) : undefined,
      delay: delay ? parseInt(delay, 10) : undefined,
      position,
      allowSkip: allowSkip === 'true'
    };

    const adTag = generateAdvancedAdTag(config);

    const requestedFormat = response || 'javascript';

    switch (requestedFormat.toLowerCase()) {
      case 'html':
        res.type('text/html').send(adTag);
        break;

      case 'json':
        res.json({
          slot,
          networkId,
          html: adTag,
          timestamp: new Date().toISOString()
        });
        break;

      case 'javascript':
      default: {
        // Return as JavaScript for easy embedding
        const jsCode = `
          (function() {
            try {
              document.write(\`${adTag.replace(/`/g, '\\`')}\`);
            } catch (e) {
              console.error('Error loading ad:', e);
            }
          })();
        `;
        res.type('application/javascript').send(jsCode);
        break;
      }
    }

    // Log the ad request (optional, can be disabled for performance)
    if (process.env.LOG_AD_REQUESTS !== 'false') {
      console.log(`📺 Ad requested: ${slot} (format: ${config.format})`);
    }
  } catch (error) {
    console.error('Error serving ad:', error);
    res.status(500).json({
      error: 'Failed to generate ad tag',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/ad/preview - Preview ad without tracking
router.get('/preview', (req, res) => {
  try {
    const { slot } = req.query;

    const validation = validateSlot(slot);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const networkId = process.env.GAM_NETWORK_ID || '22904833613';
    const adTag = generateAdTag(slot, networkId);

    // Return HTML preview page
    const previewHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ad Preview - ${slot}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .preview-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .ad-container { border: 2px dashed #ccc; padding: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="info">
          <h3>🔍 Ad Preview</h3>
          <p><strong>Slot:</strong> ${slot}</p>
          <p><strong>Network ID:</strong> ${networkId}</p>
          <p><strong>Preview Mode:</strong> Tracking disabled</p>
        </div>
        <div class="ad-container">
          ${adTag}
        </div>
      </div>
    </body>
    </html>`;

    res.type('text/html').send(previewHtml);
  } catch (error) {
    console.error('Error in ad preview:', error);
    res.status(500).json({ error: 'Failed to generate ad preview' });
  }
});

module.exports = router;
