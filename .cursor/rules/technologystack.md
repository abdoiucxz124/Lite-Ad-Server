# Technology Stack

**Architecture**: MVC Pattern, RESTful API + WebSockets, Microservices-Ready

## Core Technologies

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite with Better-SQLite3 driver
- **Real-time**: Socket.io for WebSocket connections
- **Authentication**: JWT-based authentication
- **Validation**: Joi for input validation
- **Security**: Helmet.js for security headers
- **Rate Limiting**: Express-rate-limit middleware

### Frontend
- **Language**: Modern JavaScript (ES6+)
- **Styling**: CSS Custom Properties, CSS Grid/Flexbox
- **Components**: Vanilla JS with custom web components
- **Real-time**: Socket.io client for live updates
- **Build**: No bundler (modern browser features)

### Database & Storage
- **Primary DB**: SQLite with WAL mode
- **Session Storage**: In-memory with Redis option
- **File Storage**: Local filesystem with S3 option
- **Analytics**: Time-series data with retention policies

### DevOps & Deployment
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes with auto-scaling
- **CI/CD**: GitHub Actions workflows
- **Monitoring**: Prometheus + Grafana
- **Logging**: Structured logging with Winston

### External Integrations
- **Ad Serving**: Google Ad Manager (GPT)
- **Analytics**: Google Analytics integration
- **GeoIP**: MaxMind GeoLite2 database
- **Email**: SendGrid or similar SMTP service
- **CDN**: Cloudflare or AWS CloudFront

### Development Tools
- **Linting**: ESLint with modern JavaScript rules
- **Testing**: Jest for unit/integration tests
- **Code Quality**: SonarQube for analysis
- **Documentation**: JSDoc for code documentation
- **Version Control**: Git with conventional commits

### Performance & Optimization
- **Caching**: Redis for session and query caching
- **Compression**: Gzip/Brotli compression
- **Image Optimization**: Sharp for image processing
- **CDN**: Static asset delivery optimization
- **Database**: Prepared statements and query optimization
