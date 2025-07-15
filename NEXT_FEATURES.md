# NEXT FEATURES - Codex-Compatible Prompts

Each prompt below is designed as a standalone task for GPT/Codex agents to implement on the existing lite-ad-server codebase.

---

## PROMPT 1: JWT Authentication for Admin Dashboard

**Task**: Add JWT-based authentication to secure the admin dashboard (`/admin` routes).

**Requirements**:
- Create `/api/auth/login` endpoint that accepts username/password and returns JWT
- Add middleware to protect all `/admin/*` routes except login
- Store admin credentials in environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)
- JWT should expire in 24 hours
- Add login form to `admin.html` with proper error handling
- Use `jsonwebtoken` package (add to package.json)

**Files to modify**: `src/routes/admin.js`, `src/public/admin.html`, `package.json`
**Success criteria**: Admin dashboard requires login, JWT tokens expire properly, no hardcoded credentials

---

## PROMPT 2: Custom Creative Templates System

**Task**: Add support for custom HTML/video ad creative templates beyond Google Ad Manager tags.

**Requirements**:
- Create `/api/creative` endpoint to upload/manage custom HTML templates
- Support variables in templates like `{{CLICK_URL}}`, `{{IMAGE_URL}}`, `{{TITLE}}`
- Add creative preview functionality at `/api/creative/preview/:id`
- Store templates in SQLite with fields: id, name, html_content, variables, created_at
- Add creative management UI to admin dashboard
- Support both static HTML and video (MP4/WebM) creatives

**Files to create**: `src/routes/creative.js`, database migration for creatives table
**Files to modify**: `src/routes/admin.js`, `src/public/admin.html`, `src/config.js`
**Success criteria**: Can upload, preview, and serve custom HTML/video ad creatives

---

## PROMPT 3: Real-time Analytics with WebSockets

**Task**: Add WebSocket support for real-time analytics updates in the admin dashboard.

**Requirements**:
- Implement WebSocket server using `socket.io`
- Emit real-time events for: new impressions, clicks, error rates
- Add real-time charts to admin dashboard (use Chart.js)
- Create analytics aggregation system (impressions/clicks per minute)
- Add connection status indicator in admin UI
- Support multiple concurrent admin connections

**Files to modify**: `src/server.js`, `src/routes/track.js`, `src/public/admin.html`, `package.json`
**New dependencies**: `socket.io`, Chart.js CDN
**Success criteria**: Admin dashboard shows live analytics updates without page refresh

---

## PROMPT 4: A/B Testing Framework

**Task**: Implement A/B testing capabilities for ad performance optimization.

**Requirements**:
- Create test configuration system with test name, variants (A/B), traffic split %
- Add `/api/test` endpoints to create/manage A/B tests
- Modify ad serving to randomly assign users to test variants
- Track conversion rates and statistical significance
- Add A/B test results dashboard with winner recommendation
- Store test data: test_id, variant, user_session, impression_time, conversion

**Files to create**: `src/routes/test.js`, A/B testing utilities
**Files to modify**: `src/routes/ad.js`, `src/routes/track.js`, `src/config.js`, admin dashboard
**Success criteria**: Can create A/B tests, serve variants, track performance, determine winners

---

## PROMPT 5: Fraud Detection and Bot Protection

**Task**: Add basic fraud detection to filter invalid traffic and bot impressions.

**Requirements**:
- Implement rate limiting per IP address (configurable requests per hour)
- Add User-Agent analysis to detect common bots
- Create IP reputation checking (honeypot detection)
- Add click pattern analysis (too fast clicks, repeated patterns)
- Flag suspicious traffic in analytics with "fraud" indicator
- Add fraud metrics to admin dashboard
- Create whitelist/blacklist management for IPs

**Files to modify**: `src/routes/ad.js`, `src/routes/track.js`, `src/config.js`
**Files to create**: `src/utils/fraud-detection.js`
**Success criteria**: Reduces bot traffic, provides fraud analytics, configurable protection levels

---

## PROMPT 6: Advanced Reporting and Export

**Task**: Enhance analytics with advanced reporting, scheduled exports, and email alerts.

**Requirements**:
- Add date range filtering for all analytics queries
- Create automated daily/weekly email reports
- Add revenue tracking and eCPM calculations
- Export reports in PDF format using puppeteer
- Add performance alerts (CTR drops, error rate increases)
- Create custom dashboard widgets (top performing slots, geographic data)
- Schedule reports using node-cron

**Files to modify**: `src/routes/admin.js`, `src/public/admin.html`
**Files to create**: `src/utils/reporting.js`, `src/utils/alerts.js`
**New dependencies**: `puppeteer`, `node-cron`, `nodemailer`
**Success criteria**: Automated reports, PDF exports, proactive performance alerts

---

## PROMPT 7: Geographic and Device Targeting

**Task**: Add geo-targeting and device-specific ad serving capabilities.

**Requirements**:
- Integrate IP geolocation service (GeoIP2 or similar)
- Add device detection using user-agent parsing
- Create targeting rules: country, region, device type, browser
- Modify ad serving to respect targeting rules
- Add targeting configuration to admin dashboard
- Track performance by geography and device in analytics
- Support multiple ad variants per slot based on targeting

**Files to modify**: `src/routes/ad.js`, `src/config.js`, admin dashboard
**Files to create**: `src/utils/targeting.js`
**New dependencies**: `geoip-lite` or `maxmind`
**Success criteria**: Serves different ads based on user location and device

---

## PROMPT 8: Multi-tenant Ad Network Support

**Task**: Convert to multi-tenant system supporting multiple ad publishers/networks.

**Requirements**:
- Add tenant management system with API keys
- Isolate data per tenant (separate analytics, ads, settings)
- Add tenant-specific admin dashboards at `/admin/:tenantId`
- Implement API key authentication for ad serving
- Add tenant usage limits and billing metrics
- Support custom branding per tenant
- Add super-admin interface for tenant management

**Files to modify**: All route files, database schema, admin interface
**Files to create**: `src/middleware/tenant.js`, `src/routes/super-admin.js`
**Success criteria**: Multiple publishers can use the same server with isolated data

---

## Implementation Notes

- Each prompt builds on the existing codebase
- Maintain all existing functionality and tests
- Follow the same code quality standards (ESLint, error handling)
- Update Docker configuration as needed
- Add appropriate environment variables to `.env.example`
- Ensure backward compatibility with existing API endpoints

---

## Priority Ranking

1. **JWT Authentication** - Essential for production security
2. **Custom Creatives** - Core ad serving enhancement  
3. **Real-time Analytics** - Improved UX for operators
4. **A/B Testing** - Revenue optimization feature
5. **Fraud Detection** - Quality and cost protection
6. **Advanced Reporting** - Business intelligence
7. **Targeting** - Advertiser value enhancement
8. **Multi-tenant** - Scalability and business model expansion 