# TASK 5: REVENUE OPTIMIZATION & ADVANCED ANALYTICS - DIRECT CODEX PROMPT

**COPY THIS ENTIRE PROMPT TO CODEX:**

---

Building on Tasks 1-4 (admin dashboard + ad formats + UI/UX + tag management), I need you to transform the ad server into a comprehensive revenue optimization platform with advanced analytics, machine learning insights, and automated optimization features.

**Current State After Tasks 1-4:**
- Enhanced database with campaigns, creatives, and ad formats
- Multiple ad format rendering engines with client-side optimization
- Modern admin dashboard with comprehensive UI components  
- Universal tag management system with SDK and integrations
- WebSocket real-time updates

**Objective:** Build sophisticated analytics and optimization tools that help publishers maximize ad revenue through data-driven insights, automated A/B testing, and intelligent optimization.

**Requirements:**

1. **Advanced Analytics Engine** - Enhance `src/routes/track.js`:
```javascript
// Enhanced analytics with revenue tracking
const express = require('express');
const router = express.Router();
const { statements } = require('../config');

// Revenue analytics data structure
class AnalyticsEngine {
  constructor() {
    this.metrics = {
      revenue: {
        total: 0,
        byFormat: new Map(),
        byPlacement: new Map(),
        byTimeOfDay: new Map(),
        byGeo: new Map(),
        trends: []
      },
      performance: {
        ctr: 0,        // Click-through rate
        cpm: 0,        // Cost per mille
        fillRate: 0,   // Ad fill rate
        viewability: 0, // Viewability score
        loadTime: 0    // Average load time
      },
      audience: {
        demographics: {},
        geography: {},
        devices: {},
        behaviors: {},
        engagement: {}
      }
    };
  }
  
  // Calculate performance metrics
  calculateMetrics(timeRange = '24h') {
    const query = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN event = 'impression' THEN 1 END) as impressions,
        COUNT(CASE WHEN event = 'click' THEN 1 END) as clicks,
        AVG(CASE WHEN event = 'impression' THEN revenue_amount END) as avg_cpm,
        format,
        placement,
        DATE(timestamp) as date,
        HOUR(timestamp) as hour
      FROM analytics_events 
      WHERE timestamp >= datetime('now', '-${timeRange}')
      GROUP BY format, placement, date, hour
      ORDER BY timestamp DESC
    `;
    
    return statements.analytics.all(query);
  }
  
  // Generate revenue insights
  generateRevenueInsights() {
    const insights = [];
    
    // Top performing formats
    const formatPerformance = this.calculateFormatPerformance();
    insights.push({
      type: 'format_performance',
      title: 'Best Performing Ad Formats',
      data: formatPerformance,
      recommendation: this.getFormatRecommendation(formatPerformance)
    });
    
    // Optimal timing analysis
    const timingAnalysis = this.calculateOptimalTiming();
    insights.push({
      type: 'timing_optimization',
      title: 'Optimal Ad Timing',
      data: timingAnalysis,
      recommendation: this.getTimingRecommendation(timingAnalysis)
    });
    
    // Geographic performance
    const geoPerformance = this.calculateGeoPerformance();
    insights.push({
      type: 'geo_performance',
      title: 'Geographic Performance',
      data: geoPerformance,
      recommendation: this.getGeoRecommendation(geoPerformance)
    });
    
    return insights;
  }
  
  // A/B testing framework
  createABTest(config) {
    const testId = this.generateTestId();
    const test = {
      id: testId,
      name: config.name,
      hypothesis: config.hypothesis,
      variants: config.variants,
      trafficSplit: config.trafficSplit,
      metrics: config.successMetrics,
      duration: config.duration,
      status: 'active',
      startDate: new Date(),
      results: {}
    };
    
    // Store test in database
    statements.abTests.insert.run(
      testId,
      JSON.stringify(test),
      test.status,
      test.startDate
    );
    
    return test;
  }
  
  // Analyze A/B test results
  analyzeABTestResults(testId) {
    const testData = statements.abTests.get.get(testId);
    const events = statements.analytics.getByTest.all(testId);
    
    // Statistical analysis
    const analysis = this.performStatisticalAnalysis(events);
    
    return {
      testId,
      significant: analysis.pValue < 0.05,
      confidence: analysis.confidence,
      winner: analysis.winner,
      uplift: analysis.uplift,
      recommendation: analysis.recommendation
    };
  }
}

// Enhanced tracking endpoint
router.post('/', async (req, res) => {
  try {
    const {
      event,
      format,
      slot,
      adId,
      metadata = {},
      revenue = 0,
      userId,
      sessionId,
      geo,
      device,
      abTestId,
      variant
    } = req.body;
    
    // Enhanced validation
    const validationResult = validateEnhancedTrackingData(req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ error: validationResult.error });
    }
    
    // Store enhanced tracking data
    const trackingId = statements.enhancedTracking.insert.run(
      event,
      format,
      slot,
      adId,
      JSON.stringify(metadata),
      revenue,
      userId,
      sessionId,
      geo,
      device,
      abTestId,
      variant,
      req.ip,
      req.headers['user-agent'],
      new Date().toISOString()
    );
    
    // Real-time analytics update
    const aggregatedData = updateRealTimeAggregates(req.body);
    
    // Broadcast via WebSocket
    if (req.app.locals.io) {
      req.app.locals.io.emit('analytics-update', {
        event: req.body,
        aggregates: aggregatedData,
        timestamp: Date.now()
      });
    }
    
    // Revenue optimization triggers
    if (revenue > 0) {
      triggerRevenueOptimization(req.body);
    }
    
    res.json({ 
      success: true, 
      trackingId,
      optimizations: getActiveOptimizations(slot, format)
    });
    
  } catch (error) {
    console.error('Enhanced tracking error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

// Revenue optimization API endpoints
router.get('/api/revenue-insights', (req, res) => {
  const analytics = new AnalyticsEngine();
  const insights = analytics.generateRevenueInsights();
  res.json({ insights });
});

router.post('/api/ab-test', (req, res) => {
  const analytics = new AnalyticsEngine();
  const test = analytics.createABTest(req.body);
  res.json({ test });
});

router.get('/api/ab-test/:id/results', (req, res) => {
  const analytics = new AnalyticsEngine();
  const results = analytics.analyzeABTestResults(req.params.id);
  res.json({ results });
});
```

2. **Enhanced Database Schema** - Add to `src/config.js`:
```sql
-- Advanced analytics tables
CREATE TABLE analytics_events (
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
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp),
  INDEX idx_event_type (event_type),
  INDEX idx_revenue (revenue_amount),
  INDEX idx_ab_test (ab_test_id, ab_variant),
  INDEX idx_user_session (user_id, session_id)
);

CREATE TABLE ab_tests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  config JSON NOT NULL,
  status TEXT DEFAULT 'active',
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_date DATETIME,
  results JSON,
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);

CREATE TABLE revenue_optimizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot TEXT NOT NULL,
  format TEXT NOT NULL,
  optimization_type TEXT NOT NULL,
  config JSON NOT NULL,
  performance_delta DECIMAL(8,4),
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slot_format (slot, format),
  INDEX idx_performance (performance_delta)
);

CREATE TABLE user_segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  segment_name TEXT NOT NULL,
  criteria JSON NOT NULL,
  estimated_value DECIMAL(10,4),
  user_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_value (estimated_value)
);
```

3. **Advanced Analytics Dashboard** - Add to admin interface:
```html
<!-- Advanced Analytics Tab -->
<div id="advanced-analytics" class="tab-content">
  <!-- Revenue Overview -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value" id="total-revenue">$0</div>
      <div class="stat-label">Total Revenue</div>
      <div class="stat-change" id="revenue-change">+0%</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" id="avg-cpm">$0.00</div>
      <div class="stat-label">Average CPM</div>
      <div class="stat-change" id="cpm-change">+0%</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" id="fill-rate">0%</div>
      <div class="stat-label">Fill Rate</div>
      <div class="stat-change" id="fill-rate-change">+0%</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" id="total-impressions">0</div>
      <div class="stat-label">Impressions</div>
      <div class="stat-change" id="impressions-change">+0%</div>
    </div>
  </div>
  
  <!-- Charts Section -->
  <div class="grid grid-cols-2">
    <div class="card">
      <div class="card-header">
        <h3>Revenue Trends</h3>
      </div>
      <div class="card-body">
        <canvas id="revenue-chart" width="400" height="200"></canvas>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3>Format Performance</h3>
      </div>
      <div class="card-body">
        <canvas id="format-chart" width="400" height="200"></canvas>
      </div>
    </div>
  </div>
  
  <!-- Optimization Insights -->
  <div class="card">
    <div class="card-header">
      <h3>Optimization Insights</h3>
      <button class="btn btn-primary" onclick="generateInsights()">Refresh Insights</button>
    </div>
    <div class="card-body">
      <div id="insights-container">
        <!-- Insights will be loaded here -->
      </div>
    </div>
  </div>
  
  <!-- A/B Testing Section -->
  <div class="card">
    <div class="card-header">
      <h3>A/B Testing</h3>
      <button class="btn btn-primary" onclick="createABTest()">Create New Test</button>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Status</th>
              <th>Traffic Split</th>
              <th>Confidence</th>
              <th>Winner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="ab-tests-table">
            <!-- A/B tests will be loaded here -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script>
// Advanced Analytics JavaScript
class AdvancedAnalytics {
  constructor() {
    this.charts = {};
    this.initializeCharts();
    this.loadAnalyticsData();
    this.setupRealTimeUpdates();
  }
  
  initializeCharts() {
    // Revenue trend chart
    const revenueCtx = document.getElementById('revenue-chart').getContext('2d');
    this.charts.revenue = new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Revenue',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          }
        }
      }
    });
    
    // Format performance chart
    const formatCtx = document.getElementById('format-chart').getContext('2d');
    this.charts.format = new Chart(formatCtx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#3b82f6', '#10b981', '#f59e0b', 
            '#ef4444', '#8b5cf6', '#06b6d4'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  async loadAnalyticsData() {
    try {
      const response = await fetch('/admin/api/analytics-dashboard');
      const data = await response.json();
      
      this.updateStats(data.stats);
      this.updateCharts(data.charts);
      this.loadInsights();
      this.loadABTests();
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }
  
  updateStats(stats) {
    document.getElementById('total-revenue').textContent = 
      '$' + stats.totalRevenue.toFixed(2);
    document.getElementById('avg-cpm').textContent = 
      '$' + stats.avgCPM.toFixed(2);
    document.getElementById('fill-rate').textContent = 
      (stats.fillRate * 100).toFixed(1) + '%';
    document.getElementById('total-impressions').textContent = 
      stats.totalImpressions.toLocaleString();
      
    // Update change indicators
    this.updateChangeIndicator('revenue-change', stats.revenueChange);
    this.updateChangeIndicator('cpm-change', stats.cpmChange);
    this.updateChangeIndicator('fill-rate-change', stats.fillRateChange);
    this.updateChangeIndicator('impressions-change', stats.impressionsChange);
  }
  
  updateChangeIndicator(elementId, change) {
    const element = document.getElementById(elementId);
    const isPositive = change >= 0;
    element.textContent = (isPositive ? '+' : '') + change.toFixed(1) + '%';
    element.className = 'stat-change ' + (isPositive ? 'positive' : 'negative');
  }
  
  updateCharts(chartData) {
    // Update revenue chart
    this.charts.revenue.data.labels = chartData.revenue.labels;
    this.charts.revenue.data.datasets[0].data = chartData.revenue.data;
    this.charts.revenue.update();
    
    // Update format chart
    this.charts.format.data.labels = chartData.formats.labels;
    this.charts.format.data.datasets[0].data = chartData.formats.data;
    this.charts.format.update();
  }
  
  async loadInsights() {
    try {
      const response = await fetch('/admin/api/revenue-insights');
      const data = await response.json();
      
      const container = document.getElementById('insights-container');
      container.innerHTML = data.insights.map(insight => `
        <div class="insight-card">
          <h4>${insight.title}</h4>
          <p>${insight.recommendation}</p>
          <div class="insight-data">
            ${this.renderInsightData(insight.data)}
          </div>
        </div>
      `).join('');
      
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  }
  
  renderInsightData(data) {
    // Render insight data based on type
    return Object.entries(data)
      .map(([key, value]) => `<span class="data-point">${key}: ${value}</span>`)
      .join(' ');
  }
  
  setupRealTimeUpdates() {
    // WebSocket integration for real-time updates
    if (window.socket) {
      window.socket.on('analytics-update', (data) => {
        this.handleRealTimeUpdate(data);
      });
    }
  }
  
  handleRealTimeUpdate(data) {
    // Update charts and stats in real-time
    this.updateRealtimeStats(data.aggregates);
  }
}

// Initialize advanced analytics
const advancedAnalytics = new AdvancedAnalytics();

// A/B Testing functions
async function createABTest() {
  const testConfig = {
    name: prompt('Test name:'),
    hypothesis: prompt('Test hypothesis:'),
    variants: [
      { name: 'Control', config: {} },
      { name: 'Variant A', config: {} }
    ],
    trafficSplit: 50,
    successMetrics: ['ctr', 'revenue'],
    duration: 7 // days
  };
  
  if (testConfig.name) {
    try {
      const response = await fetch('/admin/api/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testConfig)
      });
      
      const result = await response.json();
      console.log('A/B test created:', result);
      advancedAnalytics.loadABTests();
      
    } catch (error) {
      alert('Failed to create A/B test: ' + error.message);
    }
  }
}

async function generateInsights() {
  await advancedAnalytics.loadInsights();
}
</script>

4. **Machine Learning Optimization** - Add optimization engine:
```javascript
// Machine Learning Optimization Engine
class MLOptimizationEngine {
  constructor() {
    this.models = new Map();
    this.activeOptimizations = new Map();
  }
  
  // Placement optimization
  optimizePlacement(pageData, userSegment, historicalData) {
    const features = this.extractPlacementFeatures(pageData, userSegment, historicalData);
    
    // Simple rule-based optimization (can be enhanced with ML)
    const recommendations = [];
    
    if (features.scrollDepth > 0.7) {
      recommendations.push({
        type: 'placement',
        action: 'add_mid_content_ad',
        confidence: 0.85,
        expectedUplift: 0.15
      });
    }
    
    if (features.timeOnPage > 30) {
      recommendations.push({
        type: 'format',
        action: 'try_interscroller',
        confidence: 0.75,
        expectedUplift: 0.22
      });
    }
    
    return recommendations;
  }
  
  // Revenue optimization
  optimizeRevenue(slotData, marketData) {
    const currentCPM = slotData.avgCPM;
    const marketCPM = marketData.avgCPM;
    
    if (currentCPM < marketCPM * 0.8) {
      return {
        type: 'pricing',
        recommendation: 'increase_floor_price',
        suggestedFloor: marketCPM * 0.9,
        expectedUplift: 0.12
      };
    }
    
    return null;
  }
  
  // Continuous learning
  updateModel(performanceData) {
    // Update optimization models based on real performance
    this.analyzePerformancePatterns(performanceData);
  }
}
```

**Quality Requirements:**
- Real-time analytics processing (<50ms response time)
- Statistical significance testing for A/B tests
- Privacy compliance (GDPR/CCPA) 
- Scalable data processing for high-traffic sites
- Machine learning model accuracy >80%

**Integration Requirements:**
- WebSocket real-time updates
- Chart.js for data visualization
- Statistical analysis libraries
- Export capabilities (CSV, PDF)
- API rate limiting and caching

Please implement this comprehensive revenue optimization and advanced analytics platform with machine learning insights, A/B testing framework, and real-time data processing capabilities. 