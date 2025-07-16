const assert = require('assert');
const { test, describe } = require('node:test');
const path = require('path');

// Test database configuration
describe('Database Configuration', () => {
  test('should initialize database successfully', () => {
    // Set test database path
    process.env.DATABASE_PATH = path.join(__dirname, '../data/test.db');

    const fs = require('fs');
    if (fs.existsSync(process.env.DATABASE_PATH)) {
      fs.unlinkSync(process.env.DATABASE_PATH);
    }
    
    // Require config after setting env variable
    const { db, statements } = require('../src/config');
    
    assert.ok(db, 'Database should be initialized');
    assert.ok(statements, 'Prepared statements should be available');
    assert.ok(statements.insertAnalytics, 'Insert analytics statement should exist');
    assert.ok(statements.getAnalyticsSummary, 'Analytics summary statement should exist');
    
    // Clean up
    db.close();
  });
});

// Test ad slot validation
describe('Ad Slot Validation', () => {
  test('should validate slot format correctly', () => {
    const validateSlot = (slot) => {
      if (!slot || typeof slot !== 'string') {
        return { valid: false, error: 'Slot parameter is required and must be a string' };
      }
      
      if (!/^[\w\-/]+$/.test(slot)) {
        return { valid: false, error: 'Invalid slot format. Use format: network_id/ad_unit_path' };
      }
      
      return { valid: true };
    };
    
    // Valid slots
    assert.ok(validateSlot('22904833613/test-slot').valid);
    assert.ok(validateSlot('network/path/to/slot').valid);
    assert.ok(validateSlot('simple-slot').valid);
    
    // Invalid slots
    assert.ok(!validateSlot('').valid);
    assert.ok(!validateSlot(null).valid);
    assert.ok(!validateSlot(undefined).valid);
    assert.ok(!validateSlot('slot with spaces').valid);
    assert.ok(!validateSlot('slot@invalid').valid);
  });
});

// Test tracking data validation
describe('Tracking Data Validation', () => {
  test('should validate tracking events correctly', () => {
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
    
    // Valid tracking data
    assert.ok(validateTrackingData({ slot: 'test-slot', event: 'impression' }).valid);
    assert.ok(validateTrackingData({ slot: 'test-slot', event: 'click' }).valid);
    assert.ok(validateTrackingData({ slot: 'test-slot', event: 'IMPRESSION' }).valid);
    
    // Invalid tracking data
    assert.ok(!validateTrackingData({ slot: '', event: 'impression' }).valid);
    assert.ok(!validateTrackingData({ slot: 'test-slot', event: '' }).valid);
    assert.ok(!validateTrackingData({ slot: 'test-slot', event: 'invalid-event' }).valid);
  });
});

// Test environment configuration
describe('Environment Configuration', () => {
  test('should handle missing environment variables gracefully', () => {
    const originalPort = process.env.PORT;
    const originalNetworkId = process.env.GAM_NETWORK_ID;
    
    // Clear environment variables
    delete process.env.PORT;
    delete process.env.GAM_NETWORK_ID;
    
    // Test defaults
    const defaultPort = process.env.PORT || 4000;
    const defaultNetworkId = process.env.GAM_NETWORK_ID || '22904833613';
    
    assert.strictEqual(defaultPort, 4000);
    assert.strictEqual(defaultNetworkId, '22904833613');
    
    // Restore original values
    if (originalPort) process.env.PORT = originalPort;
    if (originalNetworkId) process.env.GAM_NETWORK_ID = originalNetworkId;
  });
});

// Test ad tag generation
describe('Ad Tag Generation', () => {
  test('should generate valid Google Ad Manager tags', () => {
    const generateAdTag = (slot, networkId) => {
      const cleanSlot = slot.replace(/[^a-zA-Z0-9\-_/]/g, '');
      const slotId = `gpt-${cleanSlot.replace(/[/]/g, '-')}`;
      
      return `<!-- Google Ad Manager - Slot: ${cleanSlot} -->
<div id="${slotId}">
  <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
</div>`;
    };
    
    const tag = generateAdTag('test-slot', '22904833613');
    
    assert.ok(tag.includes('Google Ad Manager'), 'Should include Google Ad Manager comment');
    assert.ok(tag.includes('gpt-test-slot'), 'Should include correct slot ID');
    assert.ok(tag.includes('securepubads.g.doubleclick.net'), 'Should include GPT script');
  });
});

