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
  insertAnalytics: db.prepare('INSERT INTO analytics (slot, event, ua, ip, referer) VALUES (?, ?, ?, ?, ?)'),
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

// Graceful shutdown
process.on('SIGINT', () => {
  if (db) {
    db.close();
    console.log('🗄️  Database connection closed');
  }
});

module.exports = { db, statements };
