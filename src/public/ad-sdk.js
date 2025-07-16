/**
 * Lite Ad Server Universal SDK
 * Supports all ad formats with optimized loading
 */
(function (window, document) {
  'use strict';

  class LiteAdSDK {
    constructor (config) {
      this.apiEndpoint = config.apiEndpoint;
      this.siteId = config.siteId;
      this.debug = config.debug || false;
      this.loadedAds = new Map();
      this.formatManagers = new Map();

      this.initializeFormatManagers();
      this.setupEventListeners();
    }

    // Initialize ad format managers
    initializeFormatManagers () {
      this.formatManagers.set('banner', new BannerAdManager());
      this.formatManagers.set('pushdown', new PushDownAdManager());
      this.formatManagers.set('interscroller', new InterscrollerAdManager());
      this.formatManagers.set('popup', new PopupAdManager());
      this.formatManagers.set('inpage', new InPageAdManager());
      this.formatManagers.set('interstitial', new InterstitialAdManager());
    }

    // Placeholder for any global event listeners
    setupEventListeners () {}

    // Auto-initialize ads on page load
    init () {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.loadAds());
      } else {
        this.loadAds();
      }
    }

    // Load all ads on the page
    loadAds () {
      const adContainers = document.querySelectorAll('[data-lite-ad]');
      adContainers.forEach(container => this.loadAd(container));
    }

    // Load individual ad
    async loadAd (container) {
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
    parseAdConfig (container) {
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
    async fetchAd (config) {
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
    async renderAd (container, adData, config) {
      const formatManager = this.formatManagers.get(config.format);

      if (formatManager) {
        await formatManager.render(container, adData, config);
        this.loadedAds.set(container, { adData, config, timestamp: Date.now() });
      } else {
        throw new Error(`Unsupported ad format: ${config.format}`);
      }
    }

    // Track events (impressions, clicks, etc.)
    trackEvent (eventType, config, adData, metadata = {}) {
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
    parseJSON (str) {
      try {
        return str ? JSON.parse(str) : null;
      } catch {
        return null;
      }
    }

    generateSlotId () {
      return `slot_${Math.random().toString(36).substr(2, 9)}`;
    }

    handleError (error, container) {
      if (this.debug) console.error('Ad loading error:', error);
      this.renderFallback(container, { error: error.message });
    }

    renderFallback (container, config) {
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
    async render (container, adData, config) {
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
    async render (container, adData, config) {
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
    async render (container, adData, config) {
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
      setTimeout(() => {
        interscroller.style.opacity = '1';
      }, 100);

      setTimeout(() => {
        if (interscroller.parentNode) interscroller.remove();
      }, config.duration || 5000);
    }
  }

  class PopupAdManager {
    async render (container, adData, config) {
      setTimeout(() => {
        /* Implement popup logic here */
      }, config.delay || 3000);
    }
  }

  class InPageAdManager {
    async render (container, adData, config) {
      /* Implement in-page notification logic */
    }
  }

  class InterstitialAdManager {
    async render (container, adData, config) {
      /* Implement full-page interstitial logic */
    }
  }

  // Global click handler
  window.LiteAdSDK = window.LiteAdSDK || {};
  window.LiteAdSDK.handleClick = function (slot, clickUrl) {
    if (window.LiteAdSDK instanceof LiteAdSDK) {
      window.LiteAdSDK.trackEvent('click', { slot }, {}, { clickUrl });
    }
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
