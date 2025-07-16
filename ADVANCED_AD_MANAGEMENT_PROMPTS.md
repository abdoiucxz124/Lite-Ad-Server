# ADVANCED AD MANAGEMENT PROMPTS
## Complete Prompts for Advanced Ad Server Development & Management Dashboard

This document contains comprehensive prompts for developing an advanced ad management system with multiple ad formats, enhanced control panels, and superior user experience.

---

## 🎯 PROMPT 1: Advanced Admin Dashboard with Multi-Format Ad Management

**Context**: You are working with a production-ready Lite Ad Server project built with Node.js, Express, SQLite, WebSocket analytics, and Google Ad Manager integration. The current system supports basic ad serving and tracking.

**Objective**: Transform the basic admin dashboard into a comprehensive ad management platform supporting multiple ad formats including PushDown, Interscroller, Popup, In-page notifications, Interstitial, Native, Video, and Banner ads.

**Technical Requirements**:
- **Current Tech Stack**: Node.js + Express + SQLite + Socket.IO + Google Ad Manager GPT
- **Frontend**: Modern HTML5/CSS3/JavaScript with responsive design
- **Real-time Features**: WebSocket integration for live updates
- **Database**: SQLite with optimized schemas for ad management
- **Security**: Authentication, input validation, rate limiting

**Implementation Tasks**:

1. **Enhanced Database Schema**:
   ```sql
   -- Create comprehensive ad management tables
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

2. **Advanced Admin Dashboard UI**:
   - **Multi-tab Interface**: Campaign Management, Creative Studio, Analytics, Settings
   - **Drag-and-Drop Creative Builder**: Visual editor for different ad formats
   - **Real-time Preview System**: Live preview of ads before deployment
   - **Advanced Analytics Dashboard**: Charts, heatmaps, conversion tracking
   - **Campaign Scheduler**: Date/time-based campaign management
   - **A/B Testing Interface**: Split testing capabilities

3. **Ad Format Management System**:
   - Support for all major ad formats: Banner, Native, Video, Popup, Interstitial, PushDown, Interscroller, In-page notifications
   - Dynamic ad format registration system
   - Custom ad format creation tools
   - Format-specific configuration panels

4. **Enhanced API Endpoints**:
   ```javascript
   // New API routes to implement
   POST /api/campaigns - Create new campaign
   GET /api/campaigns - List campaigns with filtering
   PUT /api/campaigns/:id - Update campaign
   DELETE /api/campaigns/:id - Delete campaign
   
   POST /api/creatives - Upload creative assets
   GET /api/creatives/:id/preview - Generate preview
   POST /api/creatives/:id/publish - Publish creative
   
   GET /api/analytics/dashboard - Dashboard metrics
   GET /api/analytics/campaigns/:id - Campaign-specific analytics
   POST /api/analytics/export - Export analytics data
   ```

**Quality Standards**:
- All code must pass ESLint with zero warnings
- Comprehensive test coverage (>90%)
- Mobile-responsive design (mobile-first approach)
- Load time optimization (<2 seconds)
- Accessibility compliance (WCAG 2.1 AA)
- Security hardening with input validation

**Deliverables**:
1. Enhanced admin dashboard HTML/CSS/JS
2. Updated database migrations
3. New API routes with validation
4. Comprehensive test suite
5. Documentation for new features

---

## 🎯 PROMPT 2: Multi-Format Ad Types Implementation (PushDown, Interscroller, etc.)

**Context**: Building upon the advanced admin dashboard, implement comprehensive support for multiple ad formats inspired by modern ad serving platforms like Adserver.Online demos.

**Objective**: Create a robust ad format system supporting PushDown, Interscroller, Popup, In-page notifications, Interstitial, Native, Video, HTML5, and Banner advertisements with full customization capabilities.

**Ad Format Specifications**:

1. **PushDown Ads**:
   - Expandable banner that pushes page content down
   - Smooth CSS animations and transitions
   - Configurable expansion triggers (hover, click, auto)
   - Size options: 728x90 → 728x300, 970x90 → 970x418

2. **Interscroller Ads**:
   - Full-screen ads between content sections
   - Scroll-triggered activation
   - Progressive loading and smooth transitions
   - Mobile-optimized responsive design

3. **Popup & Overlay Ads**:
   - Modal-style advertisements
   - Timing controls (delay, frequency capping)
   - Exit-intent detection
   - GDPR-compliant close mechanisms

4. **In-page Notifications**:
   - Native-looking notification bars
   - Customizable positioning (top, bottom, corner)
   - Action buttons and click tracking
   - Auto-dismiss timers

5. **Interstitial Ads**:
   - Full-page advertisements
   - Page transition integration
   - Skip functionality with countdown
   - Mobile-friendly implementation

**Implementation Requirements**:

1. **Ad Format Engine**:
   ```javascript
   // Core ad format system
   class AdFormatManager {
     constructor() {
       this.formats = new Map();
       this.activeAds = new Map();
     }
     
     registerFormat(formatConfig) {
       // Register new ad format with validation
     }
     
     renderAd(formatType, adData, targetElement) {
       // Dynamic ad rendering based on format
     }
     
     trackInteraction(adId, eventType, metadata) {
       // Enhanced interaction tracking
     }
   }
   ```

2. **Dynamic Ad Tag Generation**:
   ```javascript
   // Enhanced ad tag generator
   function generateAdvancedAdTag(config) {
     return `
       <div class="lite-ad-container" 
            data-format="${config.format}"
            data-slot="${config.slot}"
            data-size="${config.size}"
            data-targeting='${JSON.stringify(config.targeting)}'>
         <script>
           (function() {
             // Advanced ad loading with format-specific logic
             window.LiteAdServer = window.LiteAdServer || {};
             window.LiteAdServer.loadAd(${JSON.stringify(config)});
           })();
         </script>
       </div>
     `;
   }
   ```

3. **Client-Side Ad Loader**:
   - Format-specific rendering engines
   - Viewport detection and optimization
   - Lazy loading for performance
   - Fallback handling for blocked ads

4. **Advanced Targeting System**:
   - Geographic targeting
   - Device and browser targeting
   - Behavioral targeting
   - Contextual content matching
   - Time-based targeting

**Technical Implementation**:

1. **Database Extensions**:
   ```sql
   -- Enhanced ad format configurations
   INSERT INTO ad_formats (name, display_name, description, default_settings) VALUES
   ('pushdown', 'PushDown Banner', 'Expandable banner that pushes content down', 
    '{"defaultSize": "728x90", "expandedSize": "728x300", "animation": "smooth"}'),
   ('interscroller', 'Interscroller', 'Full-screen ads between content sections',
    '{"triggerOffset": 50, "duration": 5000, "allowSkip": true}'),
   ('popup', 'Popup/Modal', 'Overlay-style advertisements',
    '{"delay": 3000, "frequency": "once_per_session", "exitIntent": true}');
   ```

2. **Enhanced Creative Studio**:
   - Visual ad builder with drag-and-drop interface
   - Template library for each ad format
   - Asset management (images, videos, HTML5)
   - Preview system with device simulation
   - A/B testing creative variants

3. **Performance Optimization**:
   - CDN integration for creative assets
   - Lazy loading and progressive enhancement
   - Viewport-based loading strategies
   - Bandwidth-aware ad serving

**Quality Assurance**:
- Cross-browser compatibility testing
- Mobile responsiveness validation
- Ad-blocker compatibility assessment
- Performance benchmarking (<100ms load time)
- Accessibility testing for all formats

---

## 🎯 PROMPT 3: Advanced User Experience & Interface Design System

**Context**: Enhance the ad management platform with a modern, intuitive user interface that prioritizes usability, accessibility, and efficiency for ad managers and developers.

**Objective**: Create a comprehensive design system and user experience framework that makes ad management intuitive, powerful, and accessible to users of all technical levels.

**UI/UX Requirements**:

1. **Design System Architecture**:
   ```css
   /* Modern CSS Design System */
   :root {
     /* Color Palette */
     --primary-500: #3b82f6;
     --success-500: #10b981;
     --warning-500: #f59e0b;
     --error-500: #ef4444;
     
     /* Typography Scale */
     --text-xs: 0.75rem;
     --text-sm: 0.875rem;
     --text-base: 1rem;
     --text-lg: 1.125rem;
     
     /* Spacing Scale */
     --space-1: 0.25rem;
     --space-2: 0.5rem;
     --space-4: 1rem;
     --space-8: 2rem;
     
     /* Shadows */
     --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
     --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
   }
   ```

2. **Component Library**:
   - **Buttons**: Primary, secondary, ghost, icon buttons
   - **Forms**: Enhanced form controls with validation
   - **Data Tables**: Sortable, filterable, paginated tables
   - **Charts**: Real-time analytics visualizations
   - **Modals**: Contextual dialogs and confirmations
   - **Navigation**: Breadcrumbs, tabs, sidebar navigation

3. **Advanced Dashboard Layout**:
   ```html
   <!-- Modern Dashboard Structure -->
   <div class="admin-dashboard">
     <aside class="sidebar">
       <nav class="sidebar-nav">
         <div class="nav-section">
           <h3>Campaign Management</h3>
           <ul>
             <li><a href="#campaigns">All Campaigns</a></li>
             <li><a href="#creatives">Creative Studio</a></li>
             <li><a href="#targeting">Audience Targeting</a></li>
           </ul>
         </div>
         
         <div class="nav-section">
           <h3>Analytics & Reports</h3>
           <ul>
             <li><a href="#dashboard">Dashboard</a></li>
             <li><a href="#performance">Performance</a></li>
             <li><a href="#revenue">Revenue</a></li>
           </ul>
         </div>
       </nav>
     </aside>
     
     <main class="main-content">
       <header class="content-header">
         <div class="breadcrumb-nav"></div>
         <div class="action-buttons"></div>
       </header>
       
       <div class="content-body">
         <!-- Dynamic content area -->
       </div>
     </main>
   </div>
   ```

**Interactive Features**:

1. **Smart Campaign Wizard**:
   - Step-by-step campaign creation
   - Progress indicators and validation
   - Smart defaults based on ad format
   - Inline help and tooltips

2. **Real-time Preview System**:
   - Live preview of ad formats
   - Device simulation (desktop, tablet, mobile)
   - Interactive testing environment
   - Performance metrics preview

3. **Advanced Analytics Dashboard**:
   - Customizable widget layout
   - Real-time data updates via WebSocket
   - Interactive charts and graphs
   - Drill-down capabilities

4. **Creative Asset Manager**:
   - Drag-and-drop file uploads
   - Image optimization and compression
   - Asset library with search and filters
   - Version control for creatives

**Accessibility & Performance**:

1. **WCAG 2.1 AA Compliance**:
   - Keyboard navigation support
   - Screen reader compatibility
   - High contrast mode
   - Reduced motion preferences

2. **Performance Optimization**:
   - Code splitting and lazy loading
   - Image optimization and WebP support
   - Service worker for offline functionality
   - Progressive enhancement

3. **Mobile-First Design**:
   - Touch-friendly interface elements
   - Responsive grid system
   - Swipe gestures for mobile navigation
   - Optimized for various screen sizes

**Implementation Deliverables**:
1. Complete design system CSS framework
2. Reusable JavaScript component library
3. Enhanced admin dashboard templates
4. Mobile-responsive layouts
5. Accessibility testing reports
6. Performance optimization guide

---

## 🎯 PROMPT 4: Advanced Tag Management & Website Integration System

**Context**: Develop a sophisticated tag management system that allows website owners to easily integrate and manage various ad formats with minimal technical knowledge.

**Objective**: Create an intuitive tag generation and management system that provides website owners with easy-to-implement ad tags, real-time customization options, and comprehensive integration guides.

**Tag Management Features**:

1. **Smart Tag Generator**:
   ```javascript
   // Advanced tag generation system
   class AdvancedTagGenerator {
     generateTag(config) {
       const {
         format,        // 'banner', 'pushdown', 'interscroller', etc.
         size,          // '728x90', '300x250', 'responsive'
         placement,     // 'header', 'sidebar', 'content', 'footer'
         targeting,     // Geographic, demographic, behavioral
         scheduling,    // Time-based ad serving
         frequency,     // Frequency capping
         fallback      // Fallback behavior
       } = config;
       
       return this.buildUniversalTag({
         format,
         size,
         placement,
         targeting,
         scheduling,
         frequency,
         fallback,
         networkId: this.networkId,
         siteId: this.siteId
       });
     }
     
     buildUniversalTag(params) {
       // Generate optimized, universal ad tag
     }
   }
   ```

2. **Website Integration Wizard**:
   - **Step 1**: Website verification and setup
   - **Step 2**: Ad placement selection with visual guides
   - **Step 3**: Format and size configuration
   - **Step 4**: Targeting and scheduling setup
   - **Step 5**: Tag generation and implementation guide

3. **Visual Placement Designer**:
   - Interactive website mockup
   - Drag-and-drop ad placement
   - Real-time preview of ad positions
   - Mobile and desktop layout optimization

**Advanced Integration Options**:

1. **WordPress Plugin Integration**:
   ```php
   <?php
   // WordPress plugin for easy ad integration
   class LiteAdServerWP {
     public function init() {
       add_action('wp_head', array($this, 'add_ad_script'));
       add_shortcode('lite-ad', array($this, 'render_ad_shortcode'));
       add_action('admin_menu', array($this, 'admin_menu'));
     }
     
     public function render_ad_shortcode($atts) {
       $config = shortcode_atts(array(
         'format' => 'banner',
         'size' => '728x90',
         'slot' => '',
         'targeting' => ''
       ), $atts);
       
       return $this->generate_ad_html($config);
     }
   }
   ```

2. **Universal JavaScript SDK**:
   ```javascript
   // Universal ad SDK for any website
   (function(window, document) {
     'use strict';
     
     class LiteAdSDK {
       constructor(config) {
         this.apiEndpoint = config.apiEndpoint;
         this.siteId = config.siteId;
         this.debug = config.debug || false;
       }
       
       // Initialize ads on page load
       init() {
         if (document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', () => this.loadAds());
         } else {
           this.loadAds();
         }
       }
       
       // Load all ads on the page
       loadAds() {
         const adContainers = document.querySelectorAll('[data-lite-ad]');
         adContainers.forEach(container => this.loadAd(container));
       }
       
       // Load individual ad
       async loadAd(container) {
         const config = this.parseAdConfig(container);
         const adContent = await this.fetchAd(config);
         this.renderAd(container, adContent);
       }
     }
     
     // Auto-initialize if config is available
     if (window.LiteAdConfig) {
       const sdk = new LiteAdSDK(window.LiteAdConfig);
       sdk.init();
     }
     
   })(window, document);
   ```

3. **React/Vue Component Library**:
   ```jsx
   // React component for easy integration
   import React, { useEffect, useRef } from 'react';
   
   const LiteAdComponent = ({
     format = 'banner',
     size = '728x90',
     slot,
     targeting = {},
     onLoad,
     onError
   }) => {
     const adRef = useRef(null);
     
     useEffect(() => {
       if (window.LiteAdSDK && adRef.current) {
         window.LiteAdSDK.loadAd(adRef.current)
           .then(onLoad)
           .catch(onError);
       }
     }, [format, size, slot, targeting]);
     
     return (
       <div
         ref={adRef}
         data-lite-ad
         data-format={format}
         data-size={size}
         data-slot={slot}
         data-targeting={JSON.stringify(targeting)}
         className="lite-ad-container"
       />
     );
   };
   
   export default LiteAdComponent;
   ```

**Integration Management Dashboard**:

1. **Site Management**:
   - Website registration and verification
   - Domain authorization and security
   - Traffic analytics and insights
   - Revenue reporting per site

2. **Tag Performance Monitoring**:
   - Real-time tag performance metrics
   - Error tracking and debugging tools
   - Load time optimization suggestions
   - A/B testing for tag configurations

3. **Integration Guides**:
   - Platform-specific implementation guides
   - Code examples and snippets
   - Video tutorials and documentation
   - Community support and FAQ

**Security & Compliance**:

1. **Domain Security**:
   - Authorized domain verification
   - HTTPS enforcement
   - Content Security Policy integration
   - XSS protection mechanisms

2. **Privacy Compliance**:
   - GDPR consent management
   - CCPA compliance tools
   - Cookie policy integration
   - User data protection measures

**Implementation Deliverables**:
1. Advanced tag generator with GUI
2. Universal JavaScript SDK
3. WordPress plugin
4. React/Vue component libraries
5. Integration wizard interface
6. Comprehensive documentation
7. Security implementation guide

---

## 🎯 PROMPT 5: Revenue Optimization & Advanced Analytics Platform

**Context**: Transform the ad server into a comprehensive revenue optimization platform with advanced analytics, machine learning insights, and automated optimization features.

**Objective**: Build sophisticated analytics and optimization tools that help publishers maximize ad revenue through data-driven insights, automated A/B testing, and intelligent ad placement optimization.

**Advanced Analytics Features**:

1. **Revenue Analytics Dashboard**:
   ```javascript
   // Advanced analytics data structure
   const AnalyticsEngine = {
     metrics: {
       revenue: {
         total: 0,
         byFormat: new Map(),
         byPlacement: new Map(),
         byTimeOfDay: new Map(),
         trends: []
       },
       performance: {
         ctr: 0,
         cpm: 0,
         fillRate: 0,
         viewability: 0,
         loadTime: 0
       },
       audience: {
         demographics: {},
         geography: {},
         devices: {},
         behaviors: {}
       }
     },
     
     calculateOptimizations() {
       // ML-powered optimization suggestions
     },
     
     generateInsights() {
       // Automated insights and recommendations
     }
   };
   ```

2. **Real-time Performance Monitoring**:
   - Live revenue tracking
   - Performance anomaly detection
   - Alert system for critical issues
   - Competitive benchmarking

3. **Advanced Reporting System**:
   - Customizable report builder
   - Scheduled report delivery
   - White-label reporting for clients
   - Export capabilities (PDF, Excel, CSV)

**Machine Learning Optimization**:

1. **Intelligent Ad Placement**:
   ```python
   # ML model for optimal ad placement (conceptual)
   class AdPlacementOptimizer:
       def __init__(self):
           self.model = self.load_placement_model()
           
       def optimize_placement(self, page_data, user_data, historical_data):
           features = self.extract_features(page_data, user_data, historical_data)
           optimal_positions = self.model.predict(features)
           return self.format_recommendations(optimal_positions)
           
       def continuous_learning(self, performance_data):
           # Update model based on real performance
           self.model.partial_fit(performance_data)
   ```

2. **Dynamic Pricing Optimization**:
   - Real-time CPM optimization
   - Demand forecasting
   - Inventory management
   - Yield optimization algorithms

3. **Audience Segmentation**:
   - Behavioral analysis and clustering
   - Lookalike audience generation
   - Personalized ad experiences
   - Conversion prediction models

**Advanced Features Implementation**:

1. **A/B Testing Framework**:
   ```javascript
   class ABTestingEngine {
     createTest(config) {
       return {
         id: this.generateTestId(),
         name: config.name,
         hypothesis: config.hypothesis,
         variants: config.variants,
         trafficSplit: config.trafficSplit,
         metrics: config.successMetrics,
         duration: config.duration,
         status: 'active'
       };
     }
     
     assignVariant(userId, testId) {
       // Consistent user assignment to test variants
     }
     
     analyzeResults(testId) {
       // Statistical significance analysis
     }
   }
   ```

2. **Heatmap Analytics**:
   - Click and interaction heatmaps
   - Scroll depth analysis
   - Attention mapping
   - Mobile touch interaction tracking

3. **Conversion Tracking**:
   - Cross-device attribution
   - Custom conversion events
   - Funnel analysis
   - Customer lifetime value calculation

**Enterprise Features**:

1. **Multi-tenant Architecture**:
   - Client isolation and security
   - Custom branding per client
   - Role-based access control
   - API access management

2. **Advanced Integrations**:
   - Google Analytics 4 integration
   - Facebook Pixel connectivity
   - Third-party DMP integration
   - CRM system synchronization

3. **White-label Solutions**:
   - Customizable interface themes
   - Client-branded reporting
   - Custom domain support
   - API documentation generation

**Technical Implementation Requirements**:

1. **Enhanced Database Schema**:
   ```sql
   -- Advanced analytics tables
   CREATE TABLE analytics_events (
     id INTEGER PRIMARY KEY,
     event_type TEXT NOT NULL,
     ad_id INTEGER,
     user_session TEXT,
     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
     event_data JSON,
     revenue_amount DECIMAL(10,4),
     INDEX idx_timestamp (timestamp),
     INDEX idx_ad_revenue (ad_id, revenue_amount)
   );
   
   CREATE TABLE user_segments (
     id INTEGER PRIMARY KEY,
     segment_name TEXT NOT NULL,
     criteria JSON,
     estimated_value DECIMAL(10,4),
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Performance Optimization**:
   - Redis caching for real-time data
   - Database query optimization
   - CDN integration for global performance
   - Microservices architecture preparation

**Quality Assurance & Testing**:
- Load testing for high-traffic scenarios
- Revenue calculation accuracy testing
- Data privacy and security auditing
- Cross-browser analytics verification
- Mobile analytics functionality testing

**Deliverables**:
1. Advanced analytics dashboard
2. Machine learning optimization engine
3. A/B testing framework
4. Revenue tracking system
5. Enterprise management tools
6. API documentation
7. Performance optimization guide
8. Security and compliance documentation

---

## 🎯 PROMPT 6: Complete Integration Testing & Production Deployment

**Context**: Prepare the advanced ad management platform for production deployment with comprehensive testing, security hardening, performance optimization, and monitoring systems.

**Objective**: Ensure the platform is production-ready with enterprise-grade reliability, security, performance, and monitoring capabilities.

**Comprehensive Testing Strategy**:

1. **End-to-End Testing Suite**:
   ```javascript
   // Comprehensive E2E testing with Playwright
   const { test, expect } = require('@playwright/test');
   
   test.describe('Advanced Ad Management Platform', () => {
     test('complete campaign creation workflow', async ({ page }) => {
       // Test full campaign creation process
       await page.goto('/admin');
       await page.click('[data-testid="create-campaign"]');
       
       // Fill campaign details
       await page.fill('[data-testid="campaign-name"]', 'Test Campaign');
       await page.selectOption('[data-testid="ad-format"]', 'pushdown');
       
       // Configure targeting
       await page.click('[data-testid="targeting-tab"]');
       await page.fill('[data-testid="geographic-targeting"]', 'US,CA,UK');
       
       // Upload creative assets
       await page.setInputFiles('[data-testid="creative-upload"]', 'test-banner.jpg');
       
       // Preview and publish
       await page.click('[data-testid="preview-campaign"]');
       await expect(page.locator('[data-testid="preview-container"]')).toBeVisible();
       
       await page.click('[data-testid="publish-campaign"]');
       await expect(page.locator('.success-message')).toContainText('Campaign published successfully');
     });
     
     test('real-time analytics updates', async ({ page }) => {
       // Test WebSocket analytics functionality
     });
     
     test('tag generation and integration', async ({ page }) => {
       // Test tag generator functionality
     });
   });
   ```

2. **Performance Testing Framework**:
   ```javascript
   // Load testing with Artillery.js
   const loadTestConfig = {
     config: {
       target: 'http://localhost:3000',
       phases: [
         { duration: 60, arrivalRate: 10 },  // Warm up
         { duration: 300, arrivalRate: 50 }, // Sustained load
         { duration: 60, arrivalRate: 100 }  // Spike testing
       ]
     },
     scenarios: [
       {
         name: 'Ad serving performance',
         weight: 70,
         flow: [
           { get: { url: '/ad?slot=header&format=banner' }},
           { think: 2 },
           { post: { url: '/track', json: { event: 'impression' }}}
         ]
       },
       {
         name: 'Admin dashboard usage',
         weight: 30,
         flow: [
           { get: { url: '/admin/dashboard' }},
           { get: { url: '/admin/api/campaigns' }},
           { get: { url: '/admin/api/analytics' }}
         ]
       }
     ]
   };
   ```

3. **Security Testing & Hardening**:
   ```javascript
   // Security testing suite
   describe('Security Tests', () => {
     test('SQL injection protection', async () => {
       // Test all input fields for SQL injection vulnerabilities
     });
     
     test('XSS prevention', async () => {
       // Test Cross-Site Scripting prevention
     });
     
     test('CSRF protection', async () => {
       // Test Cross-Site Request Forgery protection
     });
     
     test('rate limiting enforcement', async () => {
       // Test API rate limiting
     });
     
     test('authentication bypass attempts', async () => {
       // Test authentication security
     });
   });
   ```

**Production Deployment Configuration**:

1. **Docker Production Setup**:
   ```dockerfile
   # Multi-stage production Dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   FROM node:18-alpine AS production
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nodeuser -u 1001
   
   WORKDIR /app
   COPY --from=builder /app/node_modules ./node_modules
   COPY --chown=nodeuser:nodejs . .
   
   USER nodeuser
   EXPOSE 3000
   
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD node healthcheck.js
   
   CMD ["node", "src/server.js"]
   ```

2. **Kubernetes Deployment**:
   ```yaml
   # k8s-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: lite-ad-server
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: lite-ad-server
     template:
       metadata:
         labels:
           app: lite-ad-server
       spec:
         containers:
         - name: lite-ad-server
           image: lite-ad-server:latest
           ports:
           - containerPort: 3000
           env:
           - name: NODE_ENV
             value: "production"
           - name: DATABASE_URL
             valueFrom:
               secretKeyRef:
                 name: db-secret
                 key: url
           resources:
             requests:
               memory: "256Mi"
               cpu: "250m"
             limits:
               memory: "512Mi"
               cpu: "500m"
           livenessProbe:
             httpGet:
               path: /health
               port: 3000
             initialDelaySeconds: 30
             periodSeconds: 10
   ```

3. **CI/CD Pipeline**:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to Production
   
   on:
     push:
       branches: [main]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run lint
         - run: npm run test
         - run: npm run test:e2e
   
     security-scan:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: npm audit
         - run: docker run --rm -v $(pwd):/app securecodewarrior/docker-scanner
   
     deploy:
       needs: [test, security-scan]
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Deploy to production
           run: |
             docker build -t lite-ad-server:${{ github.sha }} .
             docker tag lite-ad-server:${{ github.sha }} lite-ad-server:latest
             # Deploy to your platform (AWS, GCP, Azure, etc.)
   ```

**Monitoring & Observability**:

1. **Application Monitoring**:
   ```javascript
   // Enhanced monitoring with Prometheus metrics
   const prometheus = require('prom-client');
   
   const httpRequestDuration = new prometheus.Histogram({
     name: 'http_request_duration_seconds',
     help: 'Duration of HTTP requests in seconds',
     labelNames: ['method', 'route', 'status']
   });
   
   const adServeCount = new prometheus.Counter({
     name: 'ads_served_total',
     help: 'Total number of ads served',
     labelNames: ['format', 'placement']
   });
   
   const revenueMetric = new prometheus.Gauge({
     name: 'revenue_total_usd',
     help: 'Total revenue in USD'
   });
   ```

2. **Error Tracking & Logging**:
   ```javascript
   // Structured logging with Winston
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
       new winston.transports.File({ filename: 'logs/combined.log' }),
       new winston.transports.Console({
         format: winston.format.simple()
       })
     ]
   });
   ```

**Final Quality Checklist**:

✅ **Performance Requirements**:
- [ ] Page load time < 2 seconds
- [ ] Ad serving latency < 100ms
- [ ] Database queries optimized
- [ ] CDN integration configured
- [ ] Caching strategy implemented

✅ **Security Requirements**:
- [ ] All inputs validated and sanitized
- [ ] Authentication & authorization implemented
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Security headers configured

✅ **Scalability Requirements**:
- [ ] Horizontal scaling capability
- [ ] Database connection pooling
- [ ] Load balancer configuration
- [ ] Auto-scaling policies
- [ ] Graceful degradation

✅ **Monitoring Requirements**:
- [ ] Application metrics collection
- [ ] Error tracking and alerting
- [ ] Performance monitoring
- [ ] Business metrics dashboard
- [ ] Log aggregation and analysis

**Production Deployment Deliverables**:
1. Complete test suite (unit, integration, E2E)
2. Production-ready Docker configuration
3. Kubernetes deployment manifests
4. CI/CD pipeline implementation
5. Monitoring and alerting setup
6. Security hardening guide
7. Performance optimization report
8. Disaster recovery procedures
9. Production deployment checklist
10. Maintenance and support documentation

---

## 📋 Implementation Priority & Timeline

**Phase 1 (Weeks 1-2)**: Advanced Admin Dashboard & Multi-Format Support
**Phase 2 (Weeks 3-4)**: User Experience & Design System Implementation  
**Phase 3 (Weeks 5-6)**: Tag Management & Integration System
**Phase 4 (Weeks 7-8)**: Revenue Optimization & Analytics Platform
**Phase 5 (Weeks 9-10)**: Testing, Security, & Production Deployment

Each prompt builds upon the previous implementations and can be executed independently or as part of a comprehensive development cycle.

---

*This document provides complete, production-ready prompts for transforming a basic ad server into an enterprise-grade ad management platform with advanced features, security, and scalability.* 