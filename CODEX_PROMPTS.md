# 🤖 ChatGPT Plus Codex UI Prompts for Lite Ad Server

This file contains ready-to-use prompts for ChatGPT Plus Codex UI. Simply copy and paste these prompts to get AI assistance for your lite ad server project.

---

## 📋 **Project Exploration Prompts**

### **Prompt 1: Initial Project Analysis**

```
I'm working on a production-ready lightweight ad server project with Google Ad Manager integration. Please analyze this codebase and provide an overview.

**Project Context:**
- Tech Stack: Node.js, Express, SQLite, Docker
- Features: Ad serving, analytics tracking, admin dashboard
- Architecture: RESTful API with real-time capabilities
- Deployment: Container-ready with Docker

**Key Files:**
- `AGENTS.md`: Contains comprehensive project guidance
- `package.json`: Dependencies and scripts
- `src/server.js`: Express server entry point
- `src/config.js`: SQLite database configuration
- `src/routes/ad.js`: Google Ad Manager integration
- `src/routes/track.js`: Analytics tracking
- `src/routes/admin.js`: Admin dashboard API
- `src/public/admin.html`: Admin UI
- `test/basic.test.js`: Test suite
- `NEXT_FEATURES.md`: Feature roadmap
- `.codex-config.toml`: Codex configuration

**Current Status:**
- ✅ ESLint: 0 errors, 0 warnings
- ✅ Tests: All passing
- ✅ Docker: Optimized container build
- ✅ Security: Rate limiting, input validation, prepared statements

Please:
1. Analyze the project structure and architecture
2. Identify the main components and their relationships
3. Highlight any potential improvements or concerns
4. Suggest next steps for development

Follow the coding standards in AGENTS.md and maintain production quality.
```

### **Prompt 2: Code Quality Assessment**

```
Please perform a comprehensive code quality assessment of my lite ad server project.

**Assessment Areas:**
1. **Security**: Check for vulnerabilities, input validation, authentication
2. **Performance**: Analyze database queries, caching, response times
3. **Code Quality**: ESLint compliance, best practices, maintainability
4. **Testing**: Coverage, test quality, edge cases
5. **Documentation**: Code comments, API documentation, README

**Project Details:**
- Node.js Express server with SQLite database
- Google Ad Manager integration for ad serving
- Admin dashboard with analytics
- Docker deployment ready
- Production-ready with security features

**Current Quality Standards:**
- ESLint: Zero warnings policy
- Testing: All tests must pass
- Security: Rate limiting, input validation, prepared statements
- Performance: Optimized SQLite with WAL mode

Please:
1. Run quality checks against the codebase
2. Identify any issues or improvements
3. Provide specific recommendations with code examples
4. Suggest automated quality gates for CI/CD

Refer to AGENTS.md for project standards and conventions.
```

---

## 🚀 **Feature Implementation Prompts**

### **Prompt 3: JWT Authentication Implementation**

```
I need to implement JWT authentication for the admin dashboard as described in NEXT_FEATURES.md PROMPT 1.

**Current Project:**
- Lite ad server with Express.js and SQLite
- Admin dashboard at `/admin` routes (currently unprotected)
- Production-ready codebase with security best practices

**Requirements from NEXT_FEATURES.md:**
- Create `/api/auth/login` endpoint that accepts username/password and returns JWT
- Add middleware to protect all `/admin/*` routes except login
- Store admin credentials in environment variables (ADMIN_USERNAME, ADMIN_PASSWORD)
- JWT should expire in 24 hours
- Add login form to admin.html with proper error handling
- Use jsonwebtoken package (add to package.json)

**Implementation Guidelines:**
- Follow existing patterns in `src/routes/admin.js`
- Use same error handling and validation patterns as other routes
- Maintain backward compatibility
- Add comprehensive tests
- Update .env.example with new variables
- Follow security best practices from AGENTS.md

**Files to Modify:**
- `src/routes/admin.js`: Add auth middleware and login endpoint
- `src/public/admin.html`: Add login form UI
- `package.json`: Add jsonwebtoken dependency
- `.env.example`: Add admin credentials template

Please implement this feature step by step, ensuring:
1. Secure JWT implementation with proper validation
2. User-friendly login interface
3. Proper error handling and feedback
4. Comprehensive test coverage
5. Documentation updates

Test the implementation thoroughly and ensure all existing functionality continues to work.
```

### **Prompt 4: Real-time Analytics with WebSockets**

```
Implement real-time analytics with WebSockets as specified in NEXT_FEATURES.md PROMPT 3.

**Project Context:**
- Existing lite ad server with analytics tracking
- Admin dashboard with static analytics display
- SQLite database with impressions/clicks data
- Production-ready Express.js server

**Feature Requirements:**
- Implement WebSocket server using socket.io
- Emit real-time events for: new impressions, clicks, error rates
- Add real-time charts to admin dashboard (use Chart.js)
- Create analytics aggregation system (impressions/clicks per minute)
- Add connection status indicator in admin UI
- Support multiple concurrent admin connections

**Implementation Details:**
- Modify `src/server.js` to add WebSocket support
- Update `src/routes/track.js` to emit real-time events
- Enhance `src/public/admin.html` with live charts
- Add Chart.js via CDN
- Create aggregation functions for analytics data

**Technical Requirements:**
- Follow existing patterns and conventions from AGENTS.md
- Maintain all existing functionality
- Add proper error handling for WebSocket connections
- Implement reconnection logic in client
- Add comprehensive tests for WebSocket functionality
- Optimize for performance with many concurrent connections

**Files to Modify:**
- `src/server.js`: Add socket.io server setup
- `src/routes/track.js`: Emit WebSocket events on tracking
- `src/public/admin.html`: Add real-time charts and connection status
- `package.json`: Add socket.io dependency

Please implement this feature ensuring:
1. Smooth real-time updates without page refresh
2. Elegant fallback if WebSocket connection fails
3. Performance optimization for high-traffic scenarios
4. Beautiful, responsive chart interface
5. Comprehensive testing including WebSocket events

Start with the backend WebSocket implementation, then add the frontend charts.
```

### **Prompt 5: Custom Creative Templates System**

```
Implement the Custom Creative Templates System as outlined in NEXT_FEATURES.md PROMPT 2.

**Current System:**
- Lite ad server serving Google Ad Manager tags
- Express.js API with SQLite database
- Admin dashboard for analytics
- Production-ready with comprehensive testing

**Feature Specification:**
- Create `/api/creative` endpoint to upload/manage custom HTML templates
- Support variables in templates like {{CLICK_URL}}, {{IMAGE_URL}}, {{TITLE}}
- Add creative preview functionality at `/api/creative/preview/:id`
- Store templates in SQLite with fields: id, name, html_content, variables, created_at
- Add creative management UI to admin dashboard
- Support both static HTML and video (MP4/WebM) creatives

**Technical Implementation:**
- Create new route file `src/routes/creative.js`
- Add database migration for creatives table in `src/config.js`
- Extend admin dashboard with creative management interface
- Implement template variable substitution engine
- Add file upload support for video creatives
- Create preview system with iframe sandboxing

**Database Schema:**
```sql
CREATE TABLE creatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    html_content TEXT NOT NULL,
    variables JSON,
    creative_type TEXT DEFAULT 'html',
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Security Considerations:**
- Sanitize HTML content to prevent XSS
- Validate file uploads (type, size limits)
- Implement proper access controls
- Use prepared statements for database operations

Please implement this feature following the existing patterns:
1. Create the database schema and migration
2. Build the creative management API endpoints
3. Add admin dashboard UI for creative management
4. Implement the template variable system
5. Add comprehensive testing
6. Update documentation

Ensure backward compatibility and maintain all existing functionality.
```

---

## 🔧 **Code Improvement Prompts**

### **Prompt 6: Performance Optimization**

```
Optimize the performance of my lite ad server project, focusing on database queries, caching, and response times.

**Current System:**
- Node.js Express server with SQLite database
- Google Ad Manager integration
- Analytics tracking with high-volume data
- Admin dashboard with real-time updates
- Production deployment ready

**Areas for Optimization:**
1. **Database Performance:**
   - Analyze and optimize SQLite queries
   - Review indexing strategy
   - Optimize analytics aggregations
   - Consider query caching

2. **API Response Times:**
   - Cache frequently requested ad configurations
   - Optimize ad serving endpoints
   - Implement response compression
   - Add request/response timing

3. **Memory Usage:**
   - Profile memory consumption
   - Optimize data structures
   - Implement efficient caching strategies
   - Handle memory leaks

4. **Concurrent Connections:**
   - Optimize for high-traffic scenarios
   - Implement connection pooling
   - Add rate limiting optimizations
   - Scale WebSocket connections

**Performance Targets:**
- Ad serving: <50ms response time
- Analytics queries: <200ms
- Admin dashboard: <1s initial load
- Memory usage: <512MB under normal load
- Support: 1000+ concurrent users

**Analysis Required:**
1. Profile current performance bottlenecks
2. Benchmark existing response times
3. Identify optimization opportunities
4. Implement performance improvements
5. Add monitoring and alerting

Please:
1. Analyze the current codebase for performance issues
2. Implement specific optimizations with measurable improvements
3. Add performance monitoring and logging
4. Create performance tests to validate improvements
5. Document optimization strategies

Follow the patterns in AGENTS.md and maintain code quality standards.
```

### **Prompt 7: Security Hardening**

```
Perform comprehensive security hardening of my lite ad server project.

**Current Security Features:**
- Rate limiting (100 requests/minute)
- Input validation and sanitization
- Prepared statements for SQLite
- Helmet.js security headers
- CORS configuration
- Basic authentication option for admin

**Security Assessment Areas:**
1. **Authentication & Authorization:**
   - Review admin access controls
   - Implement proper session management
   - Add multi-factor authentication consideration
   - Audit password handling

2. **Input Validation & Sanitization:**
   - Analyze all user inputs
   - Review SQL injection protections
   - Check XSS prevention measures
   - Validate file upload security

3. **Network Security:**
   - Review HTTPS configuration
   - Analyze CORS policies
   - Check for exposed sensitive endpoints
   - Implement proper error handling (no information leakage)

4. **Data Protection:**
   - Review data encryption at rest
   - Analyze sensitive data handling
   - Check log sanitization
   - Implement data retention policies

5. **Dependency Security:**
   - Audit npm dependencies for vulnerabilities
   - Review third-party integrations
   - Check for outdated packages
   - Implement security update process

**Compliance Requirements:**
- GDPR considerations for analytics data
- CCPA compliance for user tracking
- Industry best practices for ad serving
- Security headers and CSP policies

**Security Tools Integration:**
- ESLint security rules
- npm audit for dependency vulnerabilities
- Automated security testing
- Security monitoring and alerting

Please:
1. Conduct thorough security audit of all code
2. Identify and fix security vulnerabilities
3. Implement additional security measures
4. Add security testing to the test suite
5. Create security documentation and guidelines
6. Set up security monitoring and alerting

Ensure all changes maintain functionality while improving security posture.
```

---

## 🧪 **Testing & Quality Prompts**

### **Prompt 8: Comprehensive Testing Implementation**

```
Implement comprehensive testing for my lite ad server project to achieve high test coverage and quality.

**Current Testing:**
- Basic test suite in `test/basic.test.js`
- Tests for database, validation, ad generation
- All tests currently passing
- Using Node.js built-in test runner

**Testing Requirements:**
1. **Unit Tests:**
   - Test all route handlers individually
   - Test database operations (CRUD)
   - Test utility functions and helpers
   - Test error handling scenarios

2. **Integration Tests:**
   - Test complete API workflows
   - Test database integration
   - Test external service integrations (Google Ad Manager)
   - Test admin dashboard functionality

3. **Performance Tests:**
   - Load testing for ad serving endpoints
   - Stress testing for analytics tracking
   - Memory leak detection
   - Response time benchmarking

4. **Security Tests:**
   - Input validation testing
   - SQL injection attempt tests
   - XSS prevention tests
   - Rate limiting validation

5. **E2E Tests:**
   - Complete user workflows
   - Admin dashboard interactions
   - Ad serving and tracking flow
   - Error scenario handling

**Test Coverage Goals:**
- Minimum 90% code coverage
- 100% critical path coverage
- All error scenarios tested
- Performance benchmarks established

**Testing Infrastructure:**
- Test database setup/teardown
- Mock external services
- Test data fixtures
- Automated test running in CI/CD

**Files to Enhance:**
- Expand `test/basic.test.js` with comprehensive cases
- Add `test/integration.test.js` for integration tests
- Add `test/performance.test.js` for load testing
- Add `test/security.test.js` for security validation

Please:
1. Analyze current test coverage and gaps
2. Implement comprehensive test suites
3. Add test utilities and helpers
4. Create test data fixtures
5. Set up automated testing pipeline
6. Add performance and security testing

Ensure tests are maintainable, fast, and provide confidence in deployments.
```

### **Prompt 9: API Documentation Generation**

```
Generate comprehensive API documentation for my lite ad server project.

**Current API Endpoints:**
- `/api/ad` - Ad serving with Google Ad Manager integration
- `/api/track/impression` - Impression tracking
- `/api/track/click` - Click tracking  
- `/admin/analytics` - Analytics data retrieval
- `/admin/stats` - Dashboard statistics
- `/admin/export` - Data export functionality

**Documentation Requirements:**
1. **OpenAPI/Swagger Specification:**
   - Complete API schema definition
   - Request/response examples
   - Authentication requirements
   - Error response documentation

2. **Interactive Documentation:**
   - Swagger UI for testing endpoints
   - Live API testing capability
   - Code examples in multiple languages
   - Authentication workflow examples

3. **Developer Guide:**
   - Getting started tutorial
   - Integration examples
   - Best practices guide
   - Troubleshooting section

4. **Technical Reference:**
   - Database schema documentation
   - Configuration options
   - Environment variables
   - Deployment instructions

**Documentation Features:**
- Auto-generated from code annotations
- Version control for API changes
- Interactive testing interface
- Code examples and snippets
- Error handling documentation

**Integration Requirements:**
- Host documentation at `/docs` endpoint
- Integrate with existing admin dashboard
- Support for API versioning
- Automated generation from code

**Files to Create/Modify:**
- Add JSDoc comments to all route files
- Create `docs/api.yaml` OpenAPI specification
- Add Swagger UI to admin interface
- Create `docs/developer-guide.md`
- Update README.md with API documentation links

Please:
1. Analyze all existing API endpoints
2. Generate comprehensive OpenAPI specification
3. Add interactive Swagger UI documentation
4. Create developer integration guide
5. Add code examples and tutorials
6. Set up automated documentation generation

Ensure documentation is accurate, up-to-date, and developer-friendly.
```

---

## 🐛 **Debugging & Troubleshooting Prompts**

### **Prompt 10: Production Issue Diagnosis**

```
Help me diagnose and fix production issues in my lite ad server deployment.

**Production Environment:**
- Node.js Express server
- SQLite database with WAL mode
- Docker container deployment
- Nginx reverse proxy
- SSL/HTTPS enabled

**Reported Issues:**
1. **Performance Degradation:**
   - Slow response times during peak traffic
   - Occasional timeout errors
   - High memory usage alerts

2. **Database Issues:**
   - SQLite lock errors under high load
   - Analytics queries taking too long
   - Database file growth concerns

3. **Ad Serving Problems:**
   - Google Ad Manager integration failures
   - Cache misses causing delays
   - Invalid ad configuration errors

4. **Monitoring Gaps:**
   - Limited visibility into performance metrics
   - Insufficient error logging
   - No alerting system

**Diagnostic Requirements:**
1. **Performance Analysis:**
   - Profile application bottlenecks
   - Analyze database query performance
   - Review memory usage patterns
   - Identify connection pool issues

2. **Error Investigation:**
   - Analyze error logs and patterns
   - Debug intermittent failures
   - Trace request flows
   - Identify root causes

3. **Monitoring Enhancement:**
   - Add comprehensive logging
   - Implement health checks
   - Create performance dashboards
   - Set up alerting system

4. **Optimization Implementation:**
   - Apply performance fixes
   - Optimize database queries
   - Implement caching strategies
   - Scale resources appropriately

**Available Data:**
- Application logs from Docker containers
- Nginx access logs
- System performance metrics
- Error reports from users

Please:
1. Analyze the reported issues and logs
2. Identify root causes and contributing factors
3. Implement fixes and optimizations
4. Add monitoring and alerting capabilities
5. Create troubleshooting documentation
6. Establish incident response procedures

Focus on immediate fixes for critical issues while implementing long-term solutions.
```

---

## 📊 **Analytics & Monitoring Prompts**

### **Prompt 11: Advanced Analytics Implementation**

```
Implement advanced analytics and monitoring for my lite ad server project.

**Current Analytics:**
- Basic impression and click tracking
- SQLite storage with timestamp data
- Simple admin dashboard with aggregated stats
- Export functionality for CSV/JSON

**Advanced Analytics Requirements:**
1. **Enhanced Tracking:**
   - User session tracking with fingerprinting
   - Geographic location data (IP geolocation)
   - Device and browser detection
   - Referrer and campaign tracking
   - A/B test group assignment

2. **Real-time Metrics:**
   - Live dashboard with auto-refresh
   - Real-time performance monitoring
   - Alert system for anomalies
   - WebSocket-based updates

3. **Business Intelligence:**
   - Revenue tracking and eCPM calculations
   - Conversion funnel analysis
   - Cohort analysis for user behavior
   - Predictive analytics for performance

4. **Data Visualization:**
   - Interactive charts and graphs
   - Customizable dashboard widgets
   - Trend analysis and forecasting
   - Comparative performance metrics

**Technical Implementation:**
- Extend SQLite schema for enhanced tracking
- Add data aggregation and ETL processes
- Implement caching for performance
- Create API endpoints for analytics data
- Build interactive dashboard components

**Analytics Schema Extensions:**
```sql
-- Enhanced tracking tables
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_fingerprint TEXT,
    ip_address TEXT,
    country TEXT,
    device_type TEXT,
    browser TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    event_type TEXT,
    slot_path TEXT,
    revenue DECIMAL(10,4),
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Performance Considerations:**
- Efficient data aggregation queries
- Caching for frequently accessed metrics
- Background processing for heavy calculations
- Data retention and archival policies

Please:
1. Design and implement enhanced analytics schema
2. Build real-time data collection system
3. Create advanced dashboard with interactive charts
4. Implement business intelligence features
5. Add comprehensive data export capabilities
6. Set up automated reporting system

Ensure scalability and maintain existing functionality.
```

---

## 🔄 **Migration & Deployment Prompts**

### **Prompt 12: Production Deployment Optimization**

```
Optimize my lite ad server for production deployment and scaling.

**Current Deployment:**
- Docker container with multi-stage build
- docker-compose.yml for local development
- SQLite database with WAL mode
- Express.js server with security middleware
- Basic environment configuration

**Production Requirements:**
1. **Scalability:**
   - Horizontal scaling capability
   - Load balancing configuration
   - Database clustering/replication
   - Auto-scaling based on traffic

2. **High Availability:**
   - Zero-downtime deployments
   - Health checks and monitoring
   - Failover mechanisms
   - Backup and disaster recovery

3. **Performance Optimization:**
   - CDN integration for static assets
   - Database connection pooling
   - Caching layers (Redis/Memcached)
   - Response compression and optimization

4. **Security Hardening:**
   - Production security configurations
   - SSL/TLS certificate management
   - Firewall and network security
   - Secrets management

**Deployment Targets:**
- **Render.com**: Simple PaaS deployment
- **Fly.io**: Global edge deployment
- **AWS ECS**: Container orchestration
- **Self-hosted VPS**: Full control deployment

**Infrastructure as Code:**
- Terraform configurations
- Kubernetes manifests
- CI/CD pipeline setup
- Environment management

**Monitoring & Observability:**
- Application performance monitoring
- Log aggregation and analysis
- Error tracking and alerting
- Business metrics dashboards

**Files to Create/Modify:**
- `deploy/render.yaml` for Render.com
- `deploy/fly.toml` for Fly.io
- `deploy/kubernetes/` manifests
- `deploy/terraform/` infrastructure
- `.github/workflows/` CI/CD pipelines
- Enhanced `docker-compose.prod.yml`

Please:
1. Create production-ready deployment configurations
2. Implement CI/CD pipelines for automated deployment
3. Add comprehensive monitoring and logging
4. Set up backup and disaster recovery
5. Create deployment documentation and runbooks
6. Optimize for cost and performance

Ensure deployments are reliable, secure, and scalable.
```

---

## 💡 **Quick Action Prompts**

### **Prompt 13: Quick Bug Fix**

```
Help me quickly identify and fix a critical bug in my lite ad server.

**Bug Report:**
[Describe the specific issue you're experiencing]

**Current System State:**
- All tests were passing before the issue
- Production deployment running normally
- Recent changes: [Describe any recent changes]

**Immediate Requirements:**
1. Quickly identify the root cause
2. Implement minimal fix to restore functionality
3. Ensure fix doesn't break existing features
4. Add test to prevent regression

Please analyze the issue and provide a fast, reliable solution.
```

### **Prompt 14: Feature Enhancement**

```
Enhance my lite ad server with [SPECIFIC FEATURE].

**Current Implementation:**
[Describe current relevant functionality]

**Enhancement Request:**
[Detailed description of the enhancement needed]

**Requirements:**
- Follow existing code patterns and conventions
- Maintain backward compatibility
- Add comprehensive tests
- Update documentation

Please implement this enhancement following the patterns established in AGENTS.md.
```

---

## 🎯 **How to Use These Prompts**

1. **Copy the entire prompt** including context and requirements
2. **Customize the bracketed sections** [like this] with your specific details
3. **Paste into ChatGPT Plus** with Codex enabled
4. **Review the AI's response** and ask follow-up questions as needed
5. **Test the implementation** thoroughly before deploying

## 📝 **Prompt Best Practices**

- ✅ **Be specific** about requirements and constraints
- ✅ **Include context** about the existing codebase
- ✅ **Reference AGENTS.md** for coding standards
- ✅ **Ask for tests** and documentation updates
- ✅ **Request step-by-step implementation**
- ✅ **Specify quality requirements** (performance, security)

---

**These prompts are designed to work with your Codex-optimized lite ad server project. Each prompt includes comprehensive context to help AI understand your specific requirements and codebase.** 