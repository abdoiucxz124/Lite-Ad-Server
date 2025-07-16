# TASK 6: PRODUCTION DEPLOYMENT & COMPREHENSIVE TESTING - DIRECT CODEX PROMPT

**COPY THIS ENTIRE PROMPT TO CODEX:**

---

Building on Tasks 1-5 (complete advanced ad management platform), I need you to prepare the system for production deployment with comprehensive testing, security hardening, performance optimization, and monitoring systems to ensure enterprise-grade reliability.

**Current State After Tasks 1-5:**
- Complete advanced ad management platform with all formats
- Modern UI/UX with comprehensive design system
- Universal tag management and integration system
- Advanced analytics with ML optimization and A/B testing
- WebSocket real-time updates and revenue optimization

**Objective:** Ensure production-ready deployment with enterprise-grade reliability, security, performance, and monitoring capabilities.

**Requirements:**

1. **Comprehensive Testing Suite** - Create comprehensive test files:

```javascript
// test/comprehensive.test.js - Complete E2E testing
const { test, expect } = require('@playwright/test');

test.describe('Advanced Ad Management Platform - E2E Tests', () => {
  
  test('complete campaign creation workflow', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin');
    
    // Create new campaign
    await page.click('[data-testid="create-campaign"]');
    
    // Fill campaign details
    await page.fill('[data-testid="campaign-name"]', 'E2E Test Campaign');
    await page.selectOption('[data-testid="ad-format"]', 'pushdown');
    await page.fill('[data-testid="campaign-description"]', 'Test campaign for E2E validation');
    
    // Configure targeting
    await page.click('[data-testid="targeting-tab"]');
    await page.fill('[data-testid="geographic-targeting"]', 'US,CA,UK');
    await page.selectOption('[data-testid="device-targeting"]', 'desktop');
    
    // Upload creative assets
    await page.setInputFiles('[data-testid="creative-upload"]', 'test/fixtures/test-banner.jpg');
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    
    // Preview campaign
    await page.click('[data-testid="preview-campaign"]');
    await expect(page.locator('[data-testid="preview-container"]')).toBeVisible();
    
    // Publish campaign
    await page.click('[data-testid="publish-campaign"]');
    await expect(page.locator('.success-message')).toContainText('Campaign published successfully');
    
    // Verify campaign appears in list
    await page.goto('/admin#campaigns');
    await expect(page.locator('[data-campaign-name="E2E Test Campaign"]')).toBeVisible();
  });
  
  test('tag generation and integration', async ({ page }) => {
    await page.goto('/admin#tag-generator');
    
    // Configure tag settings
    await page.selectOption('[name="format"]', 'interscroller');
    await page.selectOption('[name="size"]', '970x250');
    await page.selectOption('[name="placement"]', 'content');
    await page.fill('[name="geo"]', 'US,CA');
    
    // Generate tag
    await page.click('button[type="submit"]');
    
    // Verify tag generation
    await expect(page.locator('#generated-tag')).toBeVisible();
    const tagCode = await page.locator('#tag-code').inputValue();
    expect(tagCode).toContain('data-format="interscroller"');
    expect(tagCode).toContain('data-size="970x250"');
    
    // Test copy functionality
    await page.click('button:has-text("Copy to Clipboard")');
    await expect(page.locator('.alert-success')).toBeVisible();
  });
  
  test('real-time analytics dashboard', async ({ page }) => {
    await page.goto('/admin#analytics');
    
    // Verify dashboard loads
    await expect(page.locator('#total-revenue')).toBeVisible();
    await expect(page.locator('#avg-cpm')).toBeVisible();
    await expect(page.locator('#fill-rate')).toBeVisible();
    
    // Verify charts render
    await expect(page.locator('#revenue-chart')).toBeVisible();
    await expect(page.locator('#format-chart')).toBeVisible();
    
    // Test insights generation
    await page.click('button:has-text("Refresh Insights")');
    await expect(page.locator('#insights-container')).not.toBeEmpty();
  });
  
  test('A/B testing workflow', async ({ page }) => {
    await page.goto('/admin#analytics');
    
    // Create new A/B test
    await page.click('button:has-text("Create New Test")');
    
    // Fill test details (handling prompts)
    await page.evaluate(() => {
      window.prompt = () => 'Banner vs PushDown Test';
    });
    
    await page.click('button:has-text("Create New Test")');
    
    // Verify test creation
    await expect(page.locator('#ab-tests-table')).toContainText('Banner vs PushDown Test');
  });
  
  test('ad format rendering', async ({ page }) => {
    // Test each ad format
    const formats = ['banner', 'pushdown', 'interscroller', 'popup', 'inpage'];
    
    for (const format of formats) {
      await page.goto(`/test-ad?format=${format}&size=728x90`);
      await expect(page.locator('.lite-ad-container')).toBeVisible();
      
      if (format === 'pushdown') {
        // Test expansion functionality
        await page.hover('.lite-ad-pushdown');
        await expect(page.locator('.lite-ad-pushdown')).toHaveCSS('height', '270px');
      }
    }
  });
  
  test('mobile responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');
    
    // Verify mobile layout
    await expect(page.locator('.dashboard-layout')).toHaveCSS('grid-template-columns', '1fr');
    
    // Test mobile ad rendering
    await page.goto('/test-ad?format=banner&size=320x50');
    await expect(page.locator('.lite-ad-banner')).toBeVisible();
  });
  
  test('performance metrics', async ({ page }) => {
    // Test page load performance
    const response = await page.goto('/admin');
    expect(response.status()).toBe(200);
    
    // Measure load time
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    expect(loadTime).toBeLessThan(3000); // Less than 3 seconds
    
    // Test ad serving performance
    const adStartTime = Date.now();
    await page.goto('/ad?format=banner&slot=test&size=728x90');
    const adLoadTime = Date.now() - adStartTime;
    expect(adLoadTime).toBeLessThan(200); // Less than 200ms
  });
});

// Security testing
test.describe('Security Tests', () => {
  test('XSS prevention', async ({ page }) => {
    const maliciousScript = '<script>alert("XSS")</script>';
    
    // Test campaign name XSS
    await page.goto('/admin');
    await page.click('[data-testid="create-campaign"]');
    await page.fill('[data-testid="campaign-name"]', maliciousScript);
    await page.click('[data-testid="next-step"]');
    
    // Verify script is escaped
    const campaignName = await page.locator('[data-testid="campaign-name"]').inputValue();
    expect(campaignName).not.toContain('<script>');
  });
  
  test('SQL injection protection', async ({ page }) => {
    const sqlInjection = "'; DROP TABLE campaigns; --";
    
    // Test API endpoint
    const response = await page.request.get(`/ad?slot=${encodeURIComponent(sqlInjection)}`);
    expect(response.status()).toBe(400); // Should be rejected
  });
  
  test('rate limiting', async ({ page }) => {
    // Make multiple rapid requests
    const requests = [];
    for (let i = 0; i < 150; i++) {
      requests.push(page.request.get('/ad?format=banner&slot=test'));
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

2. **Production Docker Configuration**:

```dockerfile
# Multi-stage production Dockerfile
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Install runtime dependencies
RUN apk add --no-cache \
    sqlite \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy application files
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs src/ ./src/
COPY --chown=nodeuser:nodejs package.json ./
COPY --chown=nodeuser:nodejs .env.example ./.env

# Create data directory
RUN mkdir -p data && chown nodeuser:nodejs data

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "src/server.js"]
```

3. **Kubernetes Deployment Configuration**:

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: lite-ad-server

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lite-ad-server
  namespace: lite-ad-server
  labels:
    app: lite-ad-server
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
        - name: PORT
          value: "3000"
        - name: DATABASE_PATH
          value: "/data/ads.db"
        - name: ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: admin-secret
              key: password
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
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: data-volume
          mountPath: /data
      volumes:
      - name: data-volume
        persistentVolumeClaim:
          claimName: lite-ad-server-pvc

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: lite-ad-server-service
  namespace: lite-ad-server
spec:
  selector:
    app: lite-ad-server
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: lite-ad-server-ingress
  namespace: lite-ad-server
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - ads.yourdomain.com
    secretName: lite-ad-server-tls
  rules:
  - host: ads.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: lite-ad-server-service
            port:
              number: 80
```

4. **CI/CD Pipeline**:

```yaml
# .github/workflows/production-deploy.yml
name: Production Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm test
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: npm audit --audit-level high
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Docker security scan
        run: |
          docker build -t lite-ad-server:test .
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy image lite-ad-server:test

  build-and-push:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix=sha-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: [build-and-push]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Kubernetes
        run: |
          echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          
          # Update image tag
          kubectl set image deployment/lite-ad-server \
            lite-ad-server=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:sha-${{ github.sha }} \
            -n lite-ad-server
          
          # Wait for rollout
          kubectl rollout status deployment/lite-ad-server -n lite-ad-server --timeout=300s
      
      - name: Run smoke tests
        run: |
          # Wait for service to be ready
          sleep 30
          
          # Run basic health checks
          curl -f https://ads.yourdomain.com/health
          curl -f https://ads.yourdomain.com/admin
```

5. **Monitoring and Observability**:

```javascript
// src/monitoring.js - Application monitoring
const prometheus = require('prom-client');

// Create a Registry which registers the metrics
const register = new prometheus.Registry();

// Add default metrics
prometheus.collectDefaultMetrics({
  app: 'lite-ad-server',
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register
});

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

const adServeCount = new prometheus.Counter({
  name: 'ads_served_total',
  help: 'Total number of ads served',
  labelNames: ['format', 'placement', 'success']
});

const revenueTotal = new prometheus.Gauge({
  name: 'revenue_total_usd',
  help: 'Total revenue in USD'
});

const activeConnections = new prometheus.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(adServeCount);
register.registerMetric(revenueTotal);
register.registerMetric(activeConnections);

// Middleware for HTTP metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
};

// Export metrics endpoint
const getMetrics = () => register.metrics();

module.exports = {
  metricsMiddleware,
  getMetrics,
  adServeCount,
  revenueTotal,
  activeConnections
};
```

6. **Production Environment Configuration**:

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_PATH=/data/ads.db
DATABASE_BACKUP_INTERVAL=3600000

# Security
ADMIN_PASSWORD=CHANGE_ME_IN_PRODUCTION
JWT_SECRET=CHANGE_ME_IN_PRODUCTION
SESSION_SECRET=CHANGE_ME_IN_PRODUCTION

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# CORS
CORS_ORIGIN=https://yourdomain.com

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Performance
ENABLE_COMPRESSION=true
ENABLE_ETAG=true
STATIC_CACHE_MAX_AGE=86400000

# External Services
GOOGLE_AD_MANAGER_NETWORK_ID=123456789
ANALYTICS_PROVIDER=internal
```

**Production Deployment Checklist:**

✅ **Performance Requirements**:
- [ ] Page load time < 2 seconds
- [ ] Ad serving latency < 100ms  
- [ ] Database queries optimized with indexes
- [ ] CDN configured for static assets
- [ ] Gzip compression enabled

✅ **Security Requirements**:
- [ ] All inputs validated and sanitized
- [ ] HTTPS enforced with valid SSL certificate
- [ ] Security headers configured (HSTS, CSP, etc.)
- [ ] Rate limiting implemented
- [ ] Admin authentication enabled
- [ ] Database access secured

✅ **Scalability Requirements**:
- [ ] Horizontal scaling capability with load balancer
- [ ] Database connection pooling configured
- [ ] Redis caching for session and analytics data
- [ ] Auto-scaling policies defined
- [ ] Resource limits and requests set

✅ **Monitoring Requirements**:
- [ ] Prometheus metrics collection
- [ ] Grafana dashboards configured
- [ ] Error tracking and alerting (Sentry)
- [ ] Log aggregation (ELK stack)
- [ ] Uptime monitoring
- [ ] Performance monitoring (APM)

✅ **Backup & Recovery**:
- [ ] Automated database backups
- [ ] Disaster recovery procedures documented
- [ ] Data retention policies implemented
- [ ] Backup restoration tested

**Final Deployment Commands:**

```bash
# Build production image
docker build -t lite-ad-server:latest .

# Run production stack
docker-compose -f docker-compose.prod.yml up -d

# Deploy to Kubernetes
kubectl apply -f k8s/

# Verify deployment
kubectl get pods -n lite-ad-server
kubectl logs -f deployment/lite-ad-server -n lite-ad-server

# Run final tests
npm run test:production
```

Please implement this comprehensive production deployment system with testing, security, monitoring, and scalability features to ensure enterprise-grade reliability and performance. 