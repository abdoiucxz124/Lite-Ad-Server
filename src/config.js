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
      event     TEXT NOT NULL,
      format    TEXT,
      ua        TEXT,
      ip        TEXT,
      referer   TEXT,
      metadata  TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ad_formats (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT UNIQUE NOT NULL,
      display_name    TEXT,
      description     TEXT,
      default_settings TEXT
    );

    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      start_date DATE,
      end_date   DATE,
      format_id  INTEGER REFERENCES ad_formats(id),
      settings   TEXT
    );

    CREATE TABLE IF NOT EXISTS ad_creatives (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER REFERENCES ad_campaigns(id),
      html_content TEXT,
      size        TEXT,
      targeting   TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_analytics_slot ON analytics(slot);
    CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event);
    CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
  `);

  console.log('✅ Database tables initialized');
} catch (error) {
  console.error('❌ Failed to create database tables:', error);
  throw error;
}

// Prepare statements for better performance
const statements = {
  insertAnalytics: db.prepare('INSERT INTO analytics (slot, event, format, ua, ip, referer, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'),
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
  `)
};

const initializeAdFormats = () => {
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

  const insert = db.prepare(`
    INSERT OR IGNORE INTO ad_formats (name, display_name, description, default_settings)
    VALUES (@name, @display_name, @description, @default_settings)
  `);

  const transaction = db.transaction(() => {
    formats.forEach((f) => insert.run(f));
  });

  transaction();
};

// Graceful shutdown
process.on('SIGINT', () => {
  if (db) {
    db.close();
    console.log('🗄️  Database connection closed');
  }
});

module.exports = { db, statements, initializeAdFormats };
