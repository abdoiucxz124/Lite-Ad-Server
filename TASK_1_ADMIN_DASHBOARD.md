# TASK 1: ADVANCED ADMIN DASHBOARD - DIRECT CODEX PROMPT

**COPY THIS ENTIRE PROMPT TO CODEX:**

---

I'm working with a production-ready Lite Ad Server project built with Node.js, Express, SQLite, WebSocket analytics, and Google Ad Manager integration. I need you to transform the basic admin dashboard into a comprehensive ad management platform supporting multiple ad formats including PushDown, Interscroller, Popup, In-page notifications, Interstitial, Native, Video, and Banner ads.

**Current Project Structure:**
```
lite-ad-server/
├── src/
│   ├── server.js          ← Express server with Socket.IO
│   ├── config.js          ← SQLite database configuration
│   ├── routes/
│   │   ├── ad.js          ← Ad serving routes
│   │   ├── track.js       ← Analytics tracking
│   │   └── admin.js       ← Current admin routes
│   └── public/
│       ├── admin.html     ← Current basic admin UI
│       └── ad-loader.js   ← Client-side ad utilities
├── package.json           ← Dependencies including socket.io, helmet, cors
└── test/                  ← Test suite
```

**Requirements:**

1. **Enhanced Database Schema** - Add these tables to `src/config.js`:
```sql
CREATE TABLE ad_formats (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  default_settings JSON,
  required_dimensions JSON,
  supported_features JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ad_campaigns (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  format_id INTEGER REFERENCES ad_formats(id),
  targeting_settings JSON,
  schedule_settings JSON,
  budget_settings JSON,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ad_creatives (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER REFERENCES ad_campaigns(id),
  name TEXT NOT NULL,
  creative_data JSON,
  preview_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

2. **Enhanced Admin Dashboard UI** - Update `src/public/admin.html` with:
- Multi-tab interface: Campaign Management, Creative Studio, Analytics, Settings
- Modern responsive design using CSS Grid/Flexbox
- Real-time data updates via existing WebSocket connection
- Campaign creation wizard with step-by-step flow
- Creative asset upload and preview system

3. **New API Endpoints** - Add to `src/routes/admin.js`:
```javascript
// Campaign Management
POST /admin/api/campaigns - Create new campaign
GET /admin/api/campaigns - List campaigns with filtering
PUT /admin/api/campaigns/:id - Update campaign
DELETE /admin/api/campaigns/:id - Delete campaign

// Creative Management  
POST /admin/api/creatives - Create/upload creative
GET /admin/api/creatives/:id/preview - Generate preview
POST /admin/api/creatives/:id/publish - Publish creative

// Format Management
GET /admin/api/formats - List available ad formats
POST /admin/api/formats - Create custom format
```

4. **Ad Format Support** - Initialize with these formats:
```javascript
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
```

**Implementation Steps:**
1. Update database schema in `src/config.js`
2. Add new API routes to `src/routes/admin.js` 
3. Create modern admin dashboard UI in `src/public/admin.html`
4. Add campaign management functionality
5. Implement creative upload and preview system
6. Add real-time updates via existing WebSocket
7. Update tests to cover new functionality

**Quality Requirements:**
- Zero ESLint warnings: `npm run lint`
- All tests pass: `npm test`
- Mobile-responsive design
- WebSocket integration for real-time updates
- Input validation and error handling
- Modern UI with CSS Grid/Flexbox

**Current Dependencies Available:**
- express, socket.io, better-sqlite3, cors, helmet, morgan
- Frontend: HTML5, CSS3, Vanilla JavaScript

Please implement this comprehensive admin dashboard transformation while maintaining backward compatibility with existing functionality. 