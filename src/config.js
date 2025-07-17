const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.dirname(process.env.DATABASE_PATH || path.join(__dirname, '../data/ads.db'));
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 Created data directory: ${dataDir}`);
}

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/ads.db');

let db;
try {
  db = new Database(dbPath);
  console.log(`🗄️  Database connected: ${dbPath}`);

  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = 1000000');
  db.pragma('temp_store = memory');
} catch (error) {
  console.error('❌ Failed to connect to database:', error);
  throw error;
}

// Create tables
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      slot      TEXT NOT NULL,
      event     TEXT NOT NULL CHECK (event IN ('impression', 'click')),
      ua        TEXT,
      ip        TEXT,
      referer   TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Basic session and events tables
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_fingerprint TEXT,
      ip_address TEXT,
      country TEXT,
      device_type TEXT,
      browser TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      event_type TEXT,
      slot_path TEXT,
      revenue DECIMAL(10,4),
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Advanced analytics tables for revenue optimization
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      format TEXT NOT NULL,
      slot TEXT NOT NULL,
      ad_id INTEGER,
      revenue_amount DECIMAL(10,4) DEFAULT 0,
      user_id TEXT,
      session_id TEXT,
      geo_country TEXT,
      geo_region TEXT,
      device_type TEXT,
      device_os TEXT,
      browser TEXT,
      ab_test_id TEXT,
      ab_variant TEXT,
      ip_address TEXT,
      user_agent TEXT,
      referrer TEXT,
      page_url TEXT,
      viewport_width INTEGER,
      viewport_height INTEGER,
      metadata JSON,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ab_tests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      config JSON NOT NULL,
      status TEXT DEFAULT 'active',
      start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_date DATETIME,
      results JSON
    );

    CREATE TABLE IF NOT EXISTS revenue_optimizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot TEXT NOT NULL,
      format TEXT NOT NULL,
      optimization_type TEXT NOT NULL,
      config JSON NOT NULL,
      performance_delta DECIMAL(8,4),
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      segment_name TEXT NOT NULL,
      criteria JSON NOT NULL,
      estimated_value DECIMAL(10,4),
      user_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Admin management tables
    CREATE TABLE IF NOT EXISTS ad_formats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      default_settings JSON,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      format_id INTEGER,
      status TEXT DEFAULT 'draft',
      start_date DATETIME,
      end_date DATETIME,
      targeting JSON,
      settings JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (format_id) REFERENCES ad_formats(id)
    );

    CREATE TABLE IF NOT EXISTS ad_creatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER,
      name TEXT NOT NULL,
      content TEXT,
      settings JSON,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id)
    );

    -- Insert default ad formats for testing and admin interface
    INSERT OR IGNORE INTO ad_formats (id, name, type, default_settings, is_active) VALUES
      (1, 'Banner', 'banner', '{"width": 728, "height": 90}', 1),
      (2, 'PushDown', 'pushdown', '{"expand_height": 400, "animation": "slide"}', 1),
      (3, 'Interstitial', 'interstitial', '{"display_time": 5000, "closeable": true}', 1),
      (4, 'Popup', 'popup', '{"width": 400, "height": 300, "modal": true}', 1),
      (5, 'Interscroller', 'interscroller', '{"trigger_scroll": 50, "parallax": true}', 1);

    -- Indexes for basic analytics
    CREATE INDEX IF NOT EXISTS idx_analytics_slot ON analytics(slot);
    CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event);
    CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
    CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);

    -- Indexes for advanced analytics
    CREATE INDEX IF NOT EXISTS idx_timestamp ON analytics_events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_event_type ON analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_revenue ON analytics_events(revenue_amount);
    CREATE INDEX IF NOT EXISTS idx_ab_test ON analytics_events(ab_test_id, ab_variant);
    CREATE INDEX IF NOT EXISTS idx_user_session ON analytics_events(user_id, session_id);
    CREATE INDEX IF NOT EXISTS idx_status ON ab_tests(status);
    CREATE INDEX IF NOT EXISTS idx_dates ON ab_tests(start_date, end_date);
    CREATE INDEX IF NOT EXISTS idx_slot_format ON revenue_optimizations(slot, format);
    CREATE INDEX IF NOT EXISTS idx_performance ON revenue_optimizations(performance_delta);
    CREATE INDEX IF NOT EXISTS idx_value ON user_segments(estimated_value);
  `);

  console.log('✅ Database tables initialized');
} catch (error) {
  console.error('❌ Failed to create database tables:', error);
  throw error;
}

// Prepare statements for better performance
const statements = {
  // Basic analytics statements
  insertAnalytics: db.prepare('INSERT INTO analytics (slot, event, ua, ip, referer) VALUES (?, ?, ?, ?, ?)'),
  insertSession: db.prepare('INSERT OR IGNORE INTO sessions (id, user_fingerprint, ip_address, country, device_type, browser) VALUES (?, ?, ?, ?, ?, ?)'),
  insertEvent: db.prepare('INSERT INTO events (session_id, event_type, slot_path, revenue, metadata) VALUES (?, ?, ?, ?, ?)'),

  // Enhanced tracking statements
  enhancedTracking: {
    insert: db.prepare(`INSERT INTO analytics_events (
      event_type, format, slot, ad_id, revenue_amount, user_id, session_id,
      geo_country, geo_region, device_type, device_os, browser, ab_test_id,
      ab_variant, ip_address, user_agent, referrer, page_url, viewport_width,
      viewport_height, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  },

  // Analytics queries
  analytics: {
    all: (sql) => db.prepare(sql).all(),
    getByTest: db.prepare('SELECT * FROM analytics_events WHERE ab_test_id = ?')
  },

  // A/B testing statements
  abTests: {
    insert: db.prepare('INSERT INTO ab_tests (id, name, config, status, start_date) VALUES (?, ?, ?, ?, ?)'),
    get: db.prepare('SELECT config FROM ab_tests WHERE id = ?')
  },

  // Standard analytics queries
  getAnalyticsSummary: db.prepare(`
    SELECT
      slot,
      event,
      COUNT(*) as count,
      MAX(timestamp) as last_event
    FROM analytics
    GROUP BY slot, event
    ORDER BY slot, event
  `),
  getAnalyticsDetail: db.prepare(`
    SELECT * FROM analytics
    WHERE slot = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `),
  getSlotStats: db.prepare(`
    SELECT
      slot,
      SUM(CASE WHEN event = 'impression' THEN 1 ELSE 0 END) as impressions,
      SUM(CASE WHEN event = 'click' THEN 1 ELSE 0 END) as clicks,
      ROUND(
        CAST(SUM(CASE WHEN event = 'click' THEN 1 ELSE 0 END) AS FLOAT) /
        NULLIF(SUM(CASE WHEN event = 'impression' THEN 1 ELSE 0 END), 0) * 100,
        2
      ) as ctr
    FROM analytics
    GROUP BY slot
    ORDER BY impressions DESC
  `),

  // Admin API prepared statements
  getFormats: db.prepare('SELECT * FROM ad_formats ORDER BY name'),
  insertFormat: db.prepare('INSERT INTO ad_formats (name, type, default_settings, is_active) VALUES (?, ?, ?, ?)'),
  updateFormat: db.prepare('UPDATE ad_formats SET name = ?, type = ?, default_settings = ?, is_active = ? WHERE id = ?'),
  deleteFormat: db.prepare('DELETE FROM ad_formats WHERE id = ?'),

  getCampaigns: db.prepare('SELECT * FROM ad_campaigns ORDER BY created_at DESC'),
  insertCampaign: db.prepare('INSERT INTO ad_campaigns (name, format_id, status, start_date, end_date, targeting, settings) VALUES (?, ?, ?, ?, ?, ?, ?)'),
  updateCampaign: db.prepare('UPDATE ad_campaigns SET name = ?, format_id = ?, status = ?, start_date = ?, end_date = ?, targeting = ?, settings = ? WHERE id = ?'),
  deleteCampaign: db.prepare('DELETE FROM ad_campaigns WHERE id = ?'),

  getCreatives: db.prepare('SELECT * FROM ad_creatives WHERE campaign_id = ? ORDER BY created_at DESC'),
  insertCreative: db.prepare('INSERT INTO ad_creatives (campaign_id, name, content, settings, status) VALUES (?, ?, ?, ?, ?)'),
  updateCreative: db.prepare('UPDATE ad_creatives SET name = ?, content = ?, settings = ?, status = ? WHERE id = ?'),
  deleteCreative: db.prepare('DELETE FROM ad_creatives WHERE id = ?')
};

// Graceful shutdown
process.on('SIGINT', () => {
  if (db) {
    db.close();
    console.log('🗄️  Database connection closed');
  }
});

module.exports = { db, statements };
