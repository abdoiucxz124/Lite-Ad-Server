const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Default ad formats to seed database with basic options
const defaultFormats = [
  {
    name: 'banner',
    display_name: 'Banner Ad',
    description: 'Standard rectangular banner advertisements',
    default_settings: { sizes: ['728x90', '300x250', '970x250'] }
  },
  {
    name: 'pushdown',
    display_name: 'PushDown Banner',
    description: 'Expandable banner that pushes content down',
    default_settings: { defaultSize: '728x90', expandedSize: '728x300' }
  },
  {
    name: 'interscroller',
    display_name: 'Interscroller',
    description: 'Full-screen ads between content sections',
    default_settings: { triggerOffset: 50, duration: 5000 }
  },
  {
    name: 'popup',
    display_name: 'Popup/Modal',
    description: 'Overlay-style advertisements',
    default_settings: { delay: 3000, frequency: 'once_per_session' }
  },
  {
    name: 'interstitial',
    display_name: 'Interstitial',
    description: 'Full-page advertisements',
    default_settings: { allowSkip: true, skipDelay: 5 }
  }
];

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

    CREATE TABLE IF NOT EXISTS ad_formats (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      default_settings JSON,
      required_dimensions JSON,
      supported_features JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      format_id INTEGER REFERENCES ad_formats(id),
      targeting_settings JSON,
      schedule_settings JSON,
      budget_settings JSON,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ad_creatives (
      id INTEGER PRIMARY KEY,
      campaign_id INTEGER REFERENCES ad_campaigns(id),
      name TEXT NOT NULL,
      creative_data JSON,
      preview_url TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_slot ON analytics(slot);
    CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event);
    CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
  `);

  // Seed default ad formats if table is empty
  const count = db.prepare('SELECT COUNT(*) as cnt FROM ad_formats').get().cnt;
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO ad_formats (name, display_name, description, default_settings)
      VALUES (@name, @display_name, @description, @default_settings)
    `);
    const insertMany = db.transaction((formats) => {
      for (const f of formats) {
        insert.run({
          name: f.name,
          display_name: f.display_name,
          description: f.description,
          default_settings: JSON.stringify(f.default_settings || {})
        });
      }
    });
    insertMany(defaultFormats);
    console.log('📦 Seeded default ad formats');
  }

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
  `),
  getFormats: db.prepare('SELECT * FROM ad_formats ORDER BY id'),
  insertFormat: db.prepare('INSERT INTO ad_formats (name, display_name, description, default_settings) VALUES (@name, @display_name, @description, @default_settings)'),
  insertCampaign: db.prepare('INSERT INTO ad_campaigns (name, format_id, targeting_settings, schedule_settings, budget_settings, status) VALUES (@name, @format_id, @targeting_settings, @schedule_settings, @budget_settings, @status)'),
  getCampaigns: db.prepare('SELECT * FROM ad_campaigns ORDER BY id'),
  getCampaignById: db.prepare('SELECT * FROM ad_campaigns WHERE id = ?'),
  updateCampaign: db.prepare('UPDATE ad_campaigns SET name=@name, format_id=@format_id, targeting_settings=@targeting_settings, schedule_settings=@schedule_settings, budget_settings=@budget_settings, status=@status WHERE id=@id'),
  deleteCampaign: db.prepare('DELETE FROM ad_campaigns WHERE id = ?'),
  insertCreative: db.prepare('INSERT INTO ad_creatives (campaign_id, name, creative_data, preview_url, status) VALUES (@campaign_id, @name, @creative_data, @preview_url, @status)'),
  getCreative: db.prepare('SELECT * FROM ad_creatives WHERE id = ?'),
  updateCreativeStatus: db.prepare('UPDATE ad_creatives SET status=@status WHERE id=@id')
};

// Graceful shutdown
process.on('SIGINT', () => {
  if (db) {
    db.close();
    console.log('🗄️  Database connection closed');
  }
});

module.exports = { db, statements };
