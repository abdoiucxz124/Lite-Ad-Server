# TASK 2: MULTI-FORMAT AD TYPES IMPLEMENTATION - DIRECT CODEX PROMPT

**COPY THIS ENTIRE PROMPT TO CODEX:**

---

Building on the advanced admin dashboard from Task 1, I need you to implement comprehensive support for multiple ad formats with dynamic rendering engines and client-side optimization. Focus on PushDown, Interscroller, Popup, In-page notifications, and Interstitial ads.

**Current State After Task 1:**
- Enhanced database with ad_formats, ad_campaigns, ad_creatives tables
- Modern admin dashboard with campaign management
- Basic API endpoints for campaign/creative management
- WebSocket integration for real-time updates

**Objective:** Create robust ad format rendering system with client-side JavaScript engines for each ad type.

**Requirements:**

1. **Enhanced Ad Serving Engine** - Update `src/routes/ad.js`:
```javascript
// Add format-specific ad serving logic
GET /ad?format=pushdown&slot=header&size=728x90
GET /ad?format=interscroller&slot=content&targeting={"geo":"US"}
GET /ad?format=popup&slot=overlay&delay=3000
GET /ad?format=inpage&slot=notification&position=top
GET /ad?format=interstitial&slot=fullpage&allowSkip=true
```

2. **Client-Side Ad Format Engines** - Enhance `src/public/ad-loader.js`:

```javascript
// Advanced ad format system
class AdFormatManager {
  constructor() {
    this.formats = new Map();
    this.activeAds = new Map();
    this.initializeFormats();
  }
  
  // PushDown Ad Implementation
  renderPushDown(config, container) {
    // Expandable banner that pushes page content down
    // Smooth CSS animations and transitions
    // Configurable expansion triggers (hover, click, auto)
    // Size options: 728x90 → 728x300, 970x90 → 970x418
  }
  
  // Interscroller Ad Implementation  
  renderInterscroller(config, container) {
    // Full-screen ads between content sections
    // Scroll-triggered activation
    // Progressive loading and smooth transitions
    // Mobile-optimized responsive design
  }
  
  // Popup/Modal Ad Implementation
  renderPopup(config, container) {
    // Modal-style advertisements
    // Timing controls (delay, frequency capping)
    // Exit-intent detection
    // GDPR-compliant close mechanisms
  }
  
  // In-page Notification Implementation
  renderInPageNotification(config, container) {
    // Native-looking notification bars
    // Customizable positioning (top, bottom, corner)
    // Action buttons and click tracking
    // Auto-dismiss timers
  }
  
  // Interstitial Ad Implementation
  renderInterstitial(config, container) {
    // Full-page advertisements
    // Page transition integration
    // Skip functionality with countdown
    // Mobile-friendly implementation
  }
}
```

3. **Dynamic Ad Tag Generation** - Update tag generation in `src/routes/ad.js`:
```javascript
function generateAdvancedAdTag(config) {
  return `
    <div class="lite-ad-container" 
         data-format="${config.format}"
         data-slot="${config.slot}"
         data-size="${config.size}"
         data-targeting='${JSON.stringify(config.targeting)}'>
      <script>
        (function() {
          window.LiteAdServer = window.LiteAdServer || {};
          window.LiteAdServer.loadAd(${JSON.stringify(config)});
        })();
      </script>
    </div>
  `;
}
```

4. **Ad Format Specific CSS** - Create comprehensive styling:
```css
/* PushDown Animations */
.lite-ad-pushdown {
  transition: height 0.5s ease-in-out;
  overflow: hidden;
}

.lite-ad-pushdown.expanded {
  /* Expansion animations */
}

/* Interscroller Styles */
.lite-ad-interscroller {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  /* Scroll-triggered styling */
}

/* Popup/Modal Styles */
.lite-ad-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  /* Modal styling with backdrop */
}

/* In-page Notification Styles */
.lite-ad-notification {
  position: fixed;
  /* Configurable positioning */
  animation: slideIn 0.3s ease-out;
}

/* Interstitial Styles */
.lite-ad-interstitial {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10001;
  /* Full-page styling */
}
```

5. **Enhanced Tracking System** - Update `src/routes/track.js`:
```javascript
// Format-specific event tracking
POST /track - Enhanced to handle format-specific events:
{
  "event": "impression|click|expand|close|skip",
  "format": "pushdown|interscroller|popup|inpage|interstitial", 
  "slot": "header|content|overlay|notification|fullpage",
  "metadata": {
    "expandTime": 1500,      // For pushdown
    "scrollDepth": 75,       // For interscroller  
    "timeToClose": 8000,     // For popup
    "actionClicked": "cta1", // For notifications
    "skipTime": 3000         // For interstitial
  }
}
```

6. **Viewport and Performance Optimization**:
- Lazy loading for performance
- Viewport detection and optimization
- Bandwidth-aware ad serving
- Fallback handling for blocked ads

**Implementation Requirements:**

1. **Format Registration System:**
```javascript
// In src/config.js - Add format initialization
const initializeAdFormats = async () => {
  const formats = [
    {
      name: 'pushdown',
      display_name: 'PushDown Banner',
      description: 'Expandable banner that pushes content down',
      default_settings: JSON.stringify({
        defaultSize: '728x90',
        expandedSize: '728x300', 
        animation: 'smooth',
        trigger: 'hover',
        autoExpand: false
      })
    },
    {
      name: 'interscroller',
      display_name: 'Interscroller',
      description: 'Full-screen ads between content sections',
      default_settings: JSON.stringify({
        triggerOffset: 50,
        duration: 5000,
        allowSkip: true,
        skipDelay: 3
      })
    },
    {
      name: 'popup',
      display_name: 'Popup/Modal',
      description: 'Overlay-style advertisements',
      default_settings: JSON.stringify({
        delay: 3000,
        frequency: 'once_per_session',
        exitIntent: true,
        hasBackdrop: true
      })
    },
    {
      name: 'inpage',
      display_name: 'In-page Notification',
      description: 'Native-looking notification bars',
      default_settings: JSON.stringify({
        position: 'top',
        autoDismiss: 10000,
        showCloseButton: true,
        animation: 'slide'
      })
    },
    {
      name: 'interstitial',
      display_name: 'Interstitial',
      description: 'Full-page advertisements',
      default_settings: JSON.stringify({
        allowSkip: true,
        skipDelay: 5,
        showProgress: true,
        mobileOptimized: true
      })
    }
  ];
  
  // Insert formats into database
};
```

2. **Cross-browser Compatibility:**
- Modern browser feature detection
- Progressive enhancement
- Mobile responsiveness for all formats
- Touch gesture support

3. **Testing Requirements:**
- Test each ad format rendering
- Test format-specific interactions
- Test mobile responsiveness
- Test performance metrics

**Quality Standards:**
- All formats must be mobile-responsive
- Load time <100ms per ad
- Smooth animations (60fps)
- Accessibility compliance
- Ad-blocker fallback handling

**Integration with Existing System:**
- Use existing WebSocket for real-time updates
- Integrate with current analytics tracking
- Maintain existing admin dashboard compatibility
- Work with current Google Ad Manager integration

Please implement this comprehensive ad format system with all specified ad types, ensuring smooth user experience and optimal performance across all devices and browsers. 