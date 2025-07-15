(function (window) {
  'use strict';

  window.loadAd = function (slot) {
    if (!slot || typeof slot !== 'string') {
      console.error('loadAd: slot parameter is required and must be a string');
      return;
    }

    try {
      // Create and inject the ad script
      const script = document.createElement('script');
      script.src = '/api/ad?slot=' + encodeURIComponent(slot);
      script.onerror = function () {
        console.error('Failed to load ad for slot:', slot);
      };

      const currentScript = document.currentScript || document.scripts[document.scripts.length - 1];
      currentScript.parentNode.insertBefore(script, currentScript);

      // Track impression
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot, event: 'impression' })
      }).catch(function (error) {
        console.warn('Failed to track impression:', error);
      });
    } catch (error) {
      console.error('Error loading ad:', error);
    }
  };

  // Add click tracking helper
  window.trackAdClick = function (slot) {
    if (!slot) return;

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot, event: 'click' })
    }).catch(function (error) {
      console.warn('Failed to track click:', error);
    });
  };
})(window);
