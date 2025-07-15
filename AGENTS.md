
# AGENTS.md – OpenAI Codex Instructions for Lite Ad Server

This document provides comprehensive guidance for OpenAI Codex and other AI agents working with the `lite-ad-server` codebase. It serves as a specialized manual for AI teammates to understand project structure, conventions, and requirements.

---

## 🎯 Project Overview for Codex

**Project Type**: Production-ready lightweight Ad Server with Google Ad Manager integration  
**Tech Stack**: Node.js, Express, SQLite, Docker  
**Architecture**: RESTful API with admin dashboard and real-time analytics  
**Deployment**: Container-ready with Docker & docker-compose  

---

## 📁 Project Structure for Codex Navigation

```
lite-ad-server/
├── AGENTS.md              ← This file - Codex guidance
├── package.json           ← Node.js dependencies & scripts
├── Dockerfile             ← Multi-stage container build
├── docker-compose.yml     ← One-command deployment
├── .env.example           ← Environment variables template
├── src/
│   ├── server.js          ← Express server entry point
│   ├── config.js          ← SQLite database & configuration
│   ├── routes/
│   │   ├── ad.js          ← Google Ad Manager integration
│   │   ├── track.js       ← Analytics tracking endpoints
│   │   └── admin.js       ← Admin dashboard API
│   └── public/
│       ├── admin.html     ← Admin dashboard UI
│       └── ad-loader.js   ← Client-side ad utilities
├── test/
│   └── basic.test.js      ← Test suite
├── data/                  ← SQLite database directory
└── NEXT_FEATURES.md       ← Roadmap for additional features
```

---

## 🛠 Development Standards for Codex

### **Code Quality Requirements**
- **ESLint**: Zero errors, zero warnings (`npx eslint src --max-warnings=0`)
- **Testing**: All tests must pass (`npm test`)
- **Container**: Optimized Docker image (<50MB preferred)
- **Security**: Input validation, rate limiting, prepared statements

### **Coding Conventions for Codex**
- Use **modern JavaScript (ES6+)** with async/await
- Follow **Express.js best practices** for route handlers
- Implement **proper error handling** with try-catch blocks
- Use **prepared statements** for all database operations
- Add **meaningful comments** for complex business logic
- Follow **RESTful API conventions** for endpoints

### **File Naming Standards**
- Routes: `kebab-case.js` (e.g., `ad.js`, `track.js`)
- Database: `camelCase` for fields, `snake_case` for table names
- Environment: `UPPER_CASE` for variables

---

## 🏗 Architecture Guidelines for Codex

### **Database Design (SQLite)**
- Use **WAL mode** for performance
- Implement **prepared statements** for security
- Add **proper indexing** for analytics queries
- Use **transactions** for batch operations

### **API Design Principles**
- **Validation**: Validate all inputs with proper error messages
- **Rate Limiting**: 100 requests/minute default
- **CORS**: Configurable origins
- **Security Headers**: Use Helmet.js
- **Logging**: Use Morgan for request logging

### **Frontend Standards**
- **Responsive Design**: Mobile-first approach
- **Modern CSS**: Use CSS Grid/Flexbox
- **JavaScript**: Vanilla JS with modern features
- **Error Handling**: User-friendly error messages

---

## 🧪 Testing Requirements for Codex

### **Test Coverage Expectations**
- **Database Operations**: Test SQLite connection, table creation, CRUD operations
- **API Endpoints**: Test all routes with valid/invalid inputs
- **Environment Handling**: Test with/without environment variables
- **Ad Generation**: Test Google Ad Manager tag creation
- **Analytics**: Test tracking functionality

### **Running Tests**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint

# Run all quality checks
npm run check
```

---

## 🔧 Development Workflow for Codex

### **Environment Setup**
```bash
# Install dependencies
npm ci

# Copy environment template
cp .env.example .env

# Start development server
npm run dev

# Run in production mode
npm start
```

### **Docker Workflow**
```bash
# Build container
docker build -t lite-ad-server .

# Run with compose
docker-compose up --build

# Check container size
docker images lite-ad-server:latest
```

---

## 📊 Feature Implementation Guidelines

### **Google Ad Manager Integration**
- Use **GPT (Google Publisher Tag)** for ad serving
- Support **multiple ad sizes** and formats
- Implement **preview functionality** for testing
- Add **network ID configuration** via environment

### **Analytics Tracking**
- Track **impressions** and **clicks** separately
- Use **1x1 pixel** for impression tracking
- Implement **batch processing** for performance
- Store **user sessions** and **referrer data**

### **Admin Dashboard**
- **Real-time updates** with auto-refresh
- **Export capabilities** (CSV, JSON)
- **Date range filtering** for analytics
- **Connection status** monitoring

---

## 🚀 Deployment Guidelines for Codex

### **Production Requirements**
- Set **NODE_ENV=production**
- Configure **database path** for persistence
- Set **rate limiting** appropriately
- Enable **security headers**
- Configure **CORS origins**

### **Environment Variables**
```bash
# Required
PORT=3000
NODE_ENV=production

# Optional
ADMIN_AUTH=enabled
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password
GOOGLE_AD_MANAGER_NETWORK_ID=123456789
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### **Deployment Targets**
- **Render.com**: One-click deploy with automatic builds
- **Fly.io**: Global edge deployment
- **Self-hosted**: Any ARM/x86 server with Docker
- **VPS**: Direct installation with systemd service

---

## 🔍 Mandatory Quality Checks for Codex

Before any code changes are considered complete, Codex must ensure:

| Check | Command | Success Criteria |
|-------|---------|------------------|
| **Lint** | `npx eslint src --max-warnings=0` | Zero errors, zero warnings |
| **Tests** | `npm test` | All tests pass |
| **Build** | `docker build -t lite-ad-server .` | Successful container build |
| **Size** | `docker images --format '{{.Size}}' lite-ad-server:latest` | Reasonable size |

---

## 🆕 Extension Points for Codex

When implementing new features from `NEXT_FEATURES.md`:

1. **Maintain Backward Compatibility**: Existing APIs must continue working
2. **Follow Security Patterns**: Use same validation/authentication patterns
3. **Update Tests**: Add comprehensive test coverage for new features
4. **Document Changes**: Update this AGENTS.md if architecture changes
5. **Environment Variables**: Add new configs to `.env.example`

---

## 🎛 Codex-Specific Instructions

### **When Creating New Routes**
```javascript
// Template for new route files
const express = require('express');
const { db } = require('../config');
const router = express.Router();

// Add proper validation middleware
// Add rate limiting if needed
// Use prepared statements for database
// Handle errors with try-catch
// Return consistent JSON responses

module.exports = router;
```

### **When Modifying Database Schema**
- Use **migrations** for schema changes
- Update **config.js** initialization
- Add **indexes** for performance
- Test with **existing data**

### **When Adding Dependencies**
- Update **package.json** with exact versions
- Update **Dockerfile** if needed
- Test **container build** after changes
- Verify **security** of new packages

---

## 📖 Reference Links for Codex

- **Google Ad Manager GPT**: https://developers.google.com/publisher-tag
- **Express.js Guide**: https://expressjs.com/en/guide/
- **SQLite Documentation**: https://www.sqlite.org/docs.html
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/

---

## ⚡ Quick Commands for Codex

```bash
# Full development cycle
npm ci && npm run dev

# Quality check cycle  
npm run lint && npm test && docker build -t lite-ad-server .

# Production deployment
docker-compose up --build -d

# View logs
docker-compose logs -f

# Database backup
cp data/ads.db data/ads.db.backup

# Performance check
npm run test:performance
```

---

**Remember**: This is a production-ready system. All changes must maintain high quality, security, and performance standards. Codex should prioritize reliability and user experience in all implementations.
