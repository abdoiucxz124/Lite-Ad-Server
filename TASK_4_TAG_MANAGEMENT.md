# TASK 4: TAG MANAGEMENT & WEBSITE INTEGRATION - DIRECT CODEX PROMPT

**COPY THIS ENTIRE PROMPT TO CODEX:**

---

Building on Tasks 1-3 (admin dashboard + ad formats + UI/UX), I need you to create a sophisticated tag management system that allows website owners to easily integrate and manage various ad formats with minimal technical knowledge.

**Current State After Tasks 1-3:**
- Enhanced database with campaigns, creatives, and ad formats
- Multiple ad format rendering engines (PushDown, Interscroller, etc.)
- Modern admin dashboard with comprehensive UI components
- WebSocket real-time updates

**Objective:** Create an intuitive tag generation and management system with easy-to-implement ad tags, real-time customization options, and comprehensive integration guides.

**Requirements:**

1. **Smart Tag Generator** - Add to `src/routes/admin.js`:
```javascript
// Tag Generation API Endpoints
router.get('/api/tag-generator', (req, res) => {
  // Tag generator interface
});

router.post('/api/generate-tag', (req, res) => {
  const { format, size, placement, targeting, scheduling, frequency } = req.body;
  
  const tagConfig = {
    format,     // 'banner', 'pushdown', 'interscroller', etc.
    size,       // '728x90', '300x250', 'responsive'
    placement,  // 'header', 'sidebar', 'content', 'footer'
    targeting,  // Geographic, demographic, behavioral
    scheduling, // Time-based ad serving
    frequency,  // Frequency capping
    fallback    // Fallback behavior
  };
  
  const universalTag = generateUniversalTag(tagConfig);
  res.json({ tag: universalTag, config: tagConfig });
});

function generateUniversalTag(config) {
  return `
<!-- Lite Ad Server Universal Tag -->
<div class="lite-ad-container" 
     data-lite-ad
     data-format="${config.format}"
     data-size="${config.size}"
     data-placement="${config.placement}"
     data-targeting='${JSON.stringify(config.targeting)}'
     data-scheduling='${JSON.stringify(config.scheduling)}'
     data-frequency='${JSON.stringify(config.frequency)}'>
  <script>
    (function() {
      window.LiteAdConfig = window.LiteAdConfig || {
        apiEndpoint: '${process.env.API_ENDPOINT || 'http://localhost:3000'}',
        siteId: '${config.siteId}',
        debug: false
      };
      
      if (!window.LiteAdSDK) {
        var script = document.createElement('script');
        script.src = '${process.env.API_ENDPOINT || 'http://localhost:3000'}/ad-sdk.js';
        script.async = true;
        document.head.appendChild(script);
      } else {
        window.LiteAdSDK.loadAd(document.currentScript.parentElement);
      }
    })();
  </script>
</div>
<!-- End Lite Ad Server Tag -->
  `;
}
```

2. **Universal JavaScript SDK** - Create `src/public/ad-sdk.js`:
```javascript
/**
 * Lite Ad Server Universal SDK
 * Supports all ad formats with optimized loading
 */
(function(window, document) {
  'use strict';
  
  class LiteAdSDK {
    constructor(config) {
      this.apiEndpoint = config.apiEndpoint;
      this.siteId = config.siteId;
      this.debug = config.debug || false;
      this.loadedAds = new Map();
      this.formatManagers = new Map();
      
      this.initializeFormatManagers();
      this.setupEventListeners();
    }
    
    // Initialize ad format managers
    initializeFormatManagers() {
      this.formatManagers.set('banner', new BannerAdManager());
      this.formatManagers.set('pushdown', new PushDownAdManager());
      this.formatManagers.set('interscroller', new InterscrollerAdManager());
      this.formatManagers.set('popup', new PopupAdManager());
      this.formatManagers.set('inpage', new InPageAdManager());
      this.formatManagers.set('interstitial', new InterstitialAdManager());
    }
    
    // Auto-initialize ads on page load
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.loadAds());
      } else {
        this.loadAds();
      }
    }
    
    // Load all ads on the page
    loadAds() {
      const adContainers = document.querySelectorAll('[data-lite-ad]');
      adContainers.forEach(container => this.loadAd(container));
    }
    
    // Load individual ad
    async loadAd(container) {
      try {
        const config = this.parseAdConfig(container);
        const adData = await this.fetchAd(config);
        
        if (adData && adData.content) {
          await this.renderAd(container, adData, config);
          this.trackEvent('impression', config, adData);
        } else {
          this.renderFallback(container, config);
        }
      } catch (error) {
        this.handleError(error, container);
      }
    }
    
    // Parse ad configuration from container
    parseAdConfig(container) {
      return {
        format: container.dataset.format || 'banner',
        size: container.dataset.size || '728x90',
        placement: container.dataset.placement || 'content',
        targeting: this.parseJSON(container.dataset.targeting) || {},
        scheduling: this.parseJSON(container.dataset.scheduling) || {},
        frequency: this.parseJSON(container.dataset.frequency) || {},
        slot: container.dataset.slot || this.generateSlotId()
      };
    }
    
    // Fetch ad content from server
    async fetchAd(config) {
      const params = new URLSearchParams({
        format: config.format,
        size: config.size,
        placement: config.placement,
        slot: config.slot,
        targeting: JSON.stringify(config.targeting),
        url: window.location.href,
        referrer: document.referrer
      });
      
      const response = await fetch(`${this.apiEndpoint}/ad?${params}`);
      
      if (!response.ok) {
        throw new Error(`Ad fetch failed: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Render ad using appropriate format manager
    async renderAd(container, adData, config) {
      const formatManager = this.formatManagers.get(config.format);
      
      if (formatManager) {
        await formatManager.render(container, adData, config);
        this.loadedAds.set(container, { adData, config, timestamp: Date.now() });
      } else {
        throw new Error(`Unsupported ad format: ${config.format}`);
      }
    }
    
    // Track events (impressions, clicks, etc.)
    trackEvent(eventType, config, adData, metadata = {}) {
      const trackingData = {
        event: eventType,
        format: config.format,
        slot: config.slot,
        adId: adData?.id,
        timestamp: Date.now(),
        url: window.location.href,
        metadata
      };
      
      // Send tracking data
      fetch(`${this.apiEndpoint}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      }).catch(error => {
        if (this.debug) console.warn('Tracking failed:', error);
      });
    }
    
    // Utility methods
    parseJSON(str) {
      try {
        return str ? JSON.parse(str) : null;
      } catch {
        return null;
      }
    }
    
    generateSlotId() {
      return `slot_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    handleError(error, container) {
      if (this.debug) console.error('Ad loading error:', error);
      this.renderFallback(container, { error: error.message });
    }
    
    renderFallback(container, config) {
      container.innerHTML = `
        <div class="lite-ad-fallback" style="
          padding: 20px;
          text-align: center;
          background: #f0f0f0;
          color: #666;
          border: 1px dashed #ccc;
          font-family: Arial, sans-serif;
        ">
          <p>Advertisement</p>
          ${this.debug && config.error ? `<small>${config.error}</small>` : ''}
        </div>
      `;
    }
  }
  
  // Format-specific managers
  class BannerAdManager {
    async render(container, adData, config) {
      container.innerHTML = `
        <div class="lite-ad-banner" style="
          width: 100%;
          max-width: ${config.size.split('x')[0]}px;
          height: ${config.size.split('x')[1]}px;
          background: url('${adData.imageUrl}') center/cover;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
        " onclick="window.LiteAdSDK.handleClick('${config.slot}', '${adData.clickUrl}')">
          ${adData.content || ''}
        </div>
      `;
    }
  }
  
  class PushDownAdManager {
    async render(container, adData, config) {
      const defaultHeight = config.size.split('x')[1];
      const expandedHeight = config.expandedSize?.split('x')[1] || (defaultHeight * 3);
      
      container.innerHTML = `
        <div class="lite-ad-pushdown" 
             data-slot="${config.slot}"
             style="
               height: ${defaultHeight}px;
               transition: height 0.5s ease-in-out;
               overflow: hidden;
               background: url('${adData.imageUrl}') center/cover;
               cursor: pointer;
               border-radius: 4px;
             "
             onmouseenter="this.style.height='${expandedHeight}px'"
             onmouseleave="this.style.height='${defaultHeight}px'"
             onclick="window.LiteAdSDK.handleClick('${config.slot}', '${adData.clickUrl}')">
          <div style="padding: 10px; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">
            ${adData.content || 'Hover to expand'}
          </div>
        </div>
      `;
    }
  }
  
  class InterscrollerAdManager {
    async render(container, adData, config) {
      // Create fullscreen interscroller
      const interscroller = document.createElement('div');
      interscroller.className = 'lite-ad-interscroller';
      interscroller.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.5s ease;
      `;
      
      interscroller.innerHTML = `
        <div style="
          max-width: 90%;
          max-height: 90%;
          background: white;
          border-radius: 8px;
          position: relative;
          cursor: pointer;
        " onclick="window.LiteAdSDK.handleClick('${config.slot}', '${adData.clickUrl}')">
          <img src="${adData.imageUrl}" style="width: 100%; height: auto; border-radius: 8px;">
          <button onclick="event.stopPropagation(); this.closest('.lite-ad-interscroller').remove();" 
                  style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    cursor: pointer;
                  ">×</button>
        </div>
      `;
      
      document.body.appendChild(interscroller);
      setTimeout(() => interscroller.style.opacity = '1', 100);
      
      // Auto-remove after duration
      setTimeout(() => {
        if (interscroller.parentNode) interscroller.remove();
      }, config.duration || 5000);
    }
  }
  
  class PopupAdManager {
    async render(container, adData, config) {
      // Similar implementation for popup ads
      setTimeout(() => {
        // Show popup with delay
      }, config.delay || 3000);
    }
  }
  
  class InPageAdManager {
    async render(container, adData, config) {
      // Notification-style ad implementation
    }
  }
  
  class InterstitialAdManager {
    async render(container, adData, config) {
      // Full-page interstitial implementation
    }
  }
  
  // Global click handler
  window.LiteAdSDK = window.LiteAdSDK || {};
  window.LiteAdSDK.handleClick = function(slot, clickUrl) {
    // Track click event
    if (window.LiteAdSDK instanceof LiteAdSDK) {
      window.LiteAdSDK.trackEvent('click', { slot }, {}, { clickUrl });
    }
    
    // Open click URL
    if (clickUrl) {
      window.open(clickUrl, '_blank');
    }
  };
  
  // Auto-initialize if config is available
  if (window.LiteAdConfig) {
    window.LiteAdSDK = new LiteAdSDK(window.LiteAdConfig);
    window.LiteAdSDK.init();
  }
  
})(window, document);
```

3. **Tag Generator Interface** - Add to admin dashboard:
```html
<!-- Tag Generator Tab Content -->
<div id="tag-generator" class="tab-content">
  <div class="card">
    <div class="card-header">
      <h3>Universal Ad Tag Generator</h3>
      <p>Generate customized ad tags for easy website integration</p>
    </div>
    
    <div class="card-body">
      <form id="tag-generator-form">
        <div class="grid grid-cols-2">
          <!-- Ad Format Selection -->
          <div class="form-group">
            <label class="form-label">Ad Format</label>
            <select class="form-select" name="format" required>
              <option value="banner">Banner Ad</option>
              <option value="pushdown">PushDown Banner</option>
              <option value="interscroller">Interscroller</option>
              <option value="popup">Popup/Modal</option>
              <option value="inpage">In-page Notification</option>
              <option value="interstitial">Interstitial</option>
            </select>
          </div>
          
          <!-- Size Selection -->
          <div class="form-group">
            <label class="form-label">Ad Size</label>
            <select class="form-select" name="size">
              <option value="728x90">728x90 (Leaderboard)</option>
              <option value="300x250">300x250 (Medium Rectangle)</option>
              <option value="970x250">970x250 (Billboard)</option>
              <option value="320x50">320x50 (Mobile Banner)</option>
              <option value="responsive">Responsive</option>
            </select>
          </div>
          
          <!-- Placement -->
          <div class="form-group">
            <label class="form-label">Placement</label>
            <select class="form-select" name="placement">
              <option value="header">Header</option>
              <option value="sidebar">Sidebar</option>
              <option value="content">Within Content</option>
              <option value="footer">Footer</option>
            </select>
          </div>
          
          <!-- Targeting -->
          <div class="form-group">
            <label class="form-label">Geographic Targeting</label>
            <input type="text" class="form-input" name="geo" placeholder="US,CA,UK (optional)">
          </div>
        </div>
        
        <!-- Advanced Options -->
        <details class="advanced-options">
          <summary>Advanced Options</summary>
          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Frequency Capping</label>
              <select class="form-select" name="frequency">
                <option value="">No limit</option>
                <option value="once_per_session">Once per session</option>
                <option value="once_per_day">Once per day</option>
                <option value="max_3_per_day">Max 3 per day</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Scheduling</label>
              <input type="text" class="form-input" name="schedule" placeholder="9:00-17:00 (optional)">
            </div>
          </div>
        </details>
        
        <button type="submit" class="btn btn-primary">Generate Tag</button>
      </form>
    </div>
  </div>
  
  <!-- Generated Tag Display -->
  <div id="generated-tag" class="card" style="display: none;">
    <div class="card-header">
      <h3>Generated Ad Tag</h3>
      <button class="btn btn-secondary" onclick="copyToClipboard()">Copy to Clipboard</button>
    </div>
    
    <div class="card-body">
      <textarea id="tag-code" class="form-textarea" rows="10" readonly></textarea>
      
      <div class="integration-guides">
        <h4>Integration Guides:</h4>
        <div class="grid grid-cols-3">
          <div class="guide-card">
            <h5>HTML/JavaScript</h5>
            <p>Copy and paste the tag directly into your HTML</p>
          </div>
          <div class="guide-card">
            <h5>WordPress</h5>
            <p>Use our WordPress plugin or add to theme files</p>
          </div>
          <div class="guide-card">
            <h5>React/Vue</h5>
            <p>Use our component libraries for framework integration</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
// Tag Generator JavaScript
document.getElementById('tag-generator-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const config = {
    format: formData.get('format'),
    size: formData.get('size'),
    placement: formData.get('placement'),
    targeting: {
      geo: formData.get('geo')?.split(',').filter(Boolean) || []
    },
    frequency: formData.get('frequency') || null,
    schedule: formData.get('schedule') || null
  };
  
  try {
    const response = await fetch('/admin/api/generate-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    
    const result = await response.json();
    
    document.getElementById('tag-code').value = result.tag;
    document.getElementById('generated-tag').style.display = 'block';
    document.getElementById('generated-tag').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    alert('Error generating tag: ' + error.message);
  }
});

function copyToClipboard() {
  const tagCode = document.getElementById('tag-code');
  tagCode.select();
  document.execCommand('copy');
  
  // Show success notification
  const notification = document.createElement('div');
  notification.className = 'alert alert-success';
  notification.textContent = 'Tag copied to clipboard!';
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}
</script>
```

4. **WordPress Plugin Structure** - Create plugin files:
```php
<?php
/**
 * Plugin Name: Lite Ad Server Integration
 * Description: Easy integration with Lite Ad Server
 * Version: 1.0.0
 */

class LiteAdServerWP {
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        add_action('wp_head', array($this, 'add_ad_script'));
        add_shortcode('lite-ad', array($this, 'render_ad_shortcode'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    public function render_ad_shortcode($atts) {
        $config = shortcode_atts(array(
            'format' => 'banner',
            'size' => '728x90',
            'placement' => 'content',
            'targeting' => ''
        ), $atts);
        
        return $this->generate_ad_html($config);
    }
    
    private function generate_ad_html($config) {
        $targeting = !empty($config['targeting']) ? json_encode(explode(',', $config['targeting'])) : '{}';
        
        return sprintf(
            '<div data-lite-ad data-format="%s" data-size="%s" data-placement="%s" data-targeting=\'%s\'></div>',
            esc_attr($config['format']),
            esc_attr($config['size']),
            esc_attr($config['placement']),
            esc_attr($targeting)
        );
    }
}

new LiteAdServerWP();
```

**Quality Requirements:**
- Universal compatibility across all major browsers
- Mobile-responsive implementation
- Error handling and fallback mechanisms
- Performance optimization (<100ms tag load time)
- Security measures (XSS prevention, HTTPS support)

**Integration Testing:**
- Test on various website platforms (WordPress, Shopify, etc.)
- Mobile responsiveness testing
- Ad-blocker compatibility assessment
- Cross-domain functionality verification

Please implement this comprehensive tag management and integration system with universal SDK, WordPress plugin, and intuitive tag generator interface. 