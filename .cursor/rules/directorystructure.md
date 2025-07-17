# Project Directory Structure

```
lite-ad-server-with-agents/
├── .cursor/                     ← Cursor AI project rules
│   └── rules/
│       ├── global.mdc           ← Main AI rules file
│       ├── technologystack.md   ← Technology stack reference
│       └── directorystructure.md ← This file
├── .vscode/                     ← VS Code/Cursor IDE configuration
│   ├── settings.json            ← Project-specific settings
│   ├── tasks.json              ← Development task automation
│   └── extensions.json         ← Recommended extensions
├── .cursorrules                 ← Legacy rules file (deprecated)
├── AGENTS.md                   ← Codex-specific guidance
├── package.json                ← Dependencies & scripts
├── docker-compose.yml          ← Multi-service deployment
├── Dockerfile                  ← Optimized container build
├── .env.example               ← Environment configuration template
├── src/                        ← Application source code
│   ├── server.js              ← Express server entry point
│   ├── config.js              ← Database & app configuration
│   ├── routes/                ← API route handlers
│   │   ├── ad.js              ← Ad serving & management
│   │   ├── admin.js           ← Admin dashboard API
│   │   ├── track.js           ← Analytics tracking
│   │   ├── campaign.js        ← Campaign management
│   │   ├── tag.js             ← Tag management system
│   │   └── analytics.js       ← Advanced analytics
│   ├── public/                ← Static assets & client-side code
│   │   ├── admin.html         ← Admin dashboard UI
│   │   ├── ad-loader.js       ← Client-side ad utilities
│   │   ├── sdk/               ← JavaScript SDK
│   │   └── components/        ← Reusable UI components
│   ├── middleware/            ← Custom Express middleware
│   │   ├── auth.js            ← Authentication middleware
│   │   ├── validation.js      ← Input validation
│   │   ├── rateLimiter.js     ← Rate limiting
│   │   └── security.js        ← Security headers
│   ├── services/              ← Business logic services
│   │   ├── adService.js       ← Ad management logic
│   │   ├── analyticsService.js ← Analytics processing
│   │   ├── campaignService.js  ← Campaign operations
│   │   └── geoService.js       ← GeoIP functionality
│   └── utils/                 ← Helper utilities
│       ├── database.js        ← Database utilities
│       ├── validation.js      ← Validation helpers
│       ├── logging.js         ← Logging configuration
│       └── constants.js       ← Application constants
├── test/                      ← Comprehensive test suite
│   ├── unit/                  ← Unit tests
│   ├── integration/           ← Integration tests
│   ├── e2e/                   ← End-to-end tests
│   └── fixtures/              ← Test data and fixtures
├── k8s/                       ← Kubernetes manifests
│   ├── namespace.yaml         ← Kubernetes namespace
│   ├── deployment.yaml        ← Application deployment
│   ├── service.yaml           ← Service configuration
│   ├── ingress.yaml           ← Ingress configuration
│   └── configmap.yaml         ← Configuration maps
├── .github/workflows/         ← CI/CD pipeline definitions
│   ├── ci.yml                 ← Continuous integration
│   ├── cd.yml                 ← Continuous deployment
│   ├── security.yml           ← Security scanning
│   └── quality.yml            ← Code quality checks
├── data/                      ← SQLite database storage
│   ├── ads.db                 ← Main application database
│   └── backups/               ← Database backups
├── docs/                      ← Project documentation
│   ├── api/                   ← API documentation
│   ├── deployment/            ← Deployment guides
│   └── architecture/          ← Architecture diagrams
├── wordpress-plugin/          ← WordPress integration
│   ├── lite-ad-server.php     ← Main plugin file
│   ├── includes/              ← Plugin functionality
│   └── assets/                ← Plugin assets
├── logs/                      ← Application logs
│   ├── access.log             ← HTTP access logs
│   ├── error.log              ← Error logs
│   └── debug.log              ← Debug information
└── scripts/                   ← Utility scripts
    ├── setup.sh               ← Environment setup
    ├── deploy.sh              ← Deployment script
    ├── backup.sh              ← Database backup
    └── migrate.sh             ← Database migrations
```

## Key Directory Purposes

### Source Code (`src/`)
- **server.js**: Main application entry point with Express setup
- **config.js**: Centralized configuration management
- **routes/**: RESTful API endpoints organized by feature
- **public/**: Client-side assets and admin interface
- **middleware/**: Reusable Express middleware functions
- **services/**: Business logic separated from routes
- **utils/**: Shared utilities and helper functions

### Testing (`test/`)
- **unit/**: Isolated component testing
- **integration/**: API endpoint testing with database
- **e2e/**: Full user journey testing
- **fixtures/**: Reusable test data and mocks

### DevOps & Deployment
- **k8s/**: Production Kubernetes configurations
- **.github/workflows/**: Automated CI/CD pipelines
- **docker-compose.yml**: Development environment setup
- **Dockerfile**: Optimized production container

### Documentation & Configuration
- **.cursor/rules/**: Modern Cursor AI project rules
- **.vscode/**: IDE-specific settings and tasks
- **docs/**: Comprehensive project documentation
- **AGENTS.md**: AI assistant guidance and patterns

### Data & Logs
- **data/**: SQLite database files and backups
- **logs/**: Application logging output
- **scripts/**: Administrative and deployment scripts
