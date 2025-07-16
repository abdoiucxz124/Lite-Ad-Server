(function (window, document) {
  'use strict';

  class AdFormatManager {
    constructor () {
      this.formats = new Map();
      this.activeAds = new Map();
      this.initializeFormats();
    }

    initializeFormats () {
      this.formats.set('pushdown', this.renderPushDown.bind(this));
      this.formats.set('interscroller', this.renderInterscroller.bind(this));
      this.formats.set('popup', this.renderPopup.bind(this));
      this.formats.set('inpage', this.renderInPageNotification.bind(this));
      this.formats.set('interstitial', this.renderInterstitial.bind(this));
    }

    render (config, container) {
      const renderer = this.formats.get((config.format || '').toLowerCase());
      if (renderer) {
        renderer(config, container);
      } else {
        console.warn('Unknown ad format:', config.format);
      }
    }

    renderPushDown (config, container) {
      const ad = document.createElement('div');
      ad.className = 'lite-ad-pushdown';
      ad.style.height = (config.size || '90') + 'px';
      container.appendChild(ad);
    }

    renderInterscroller (config, container) {
      const ad = document.createElement('div');
      ad.className = 'lite-ad-interscroller';
      container.appendChild(ad);
    }

    renderPopup (config, container) {
      const ad = document.createElement('div');
      ad.className = 'lite-ad-popup';
      container.appendChild(ad);
    }

    renderInPageNotification (config, container) {
      const ad = document.createElement('div');
      ad.className = 'lite-ad-notification';
      container.appendChild(ad);
    }

    renderInterstitial (config, container) {
      const ad = document.createElement('div');
      ad.className = 'lite-ad-interstitial';
      container.appendChild(ad);
    }
  }

  const manager = new AdFormatManager();

  function loadAd (config) {
    const script = document.currentScript;
    const container = script.parentNode;

    const render = () => manager.render(config, container);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) {
          obs.disconnect();
          render();
        }
      });
      observer.observe(container);
    } else {
      render();
    }
  }

  window.LiteAdServer = window.LiteAdServer || {};
  window.LiteAdServer.loadAd = loadAd;
})(window, document);
