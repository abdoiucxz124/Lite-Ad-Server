const prometheus = require('prom-client');

// Create a Registry to register the metrics
const register = new prometheus.Registry();

// Collect default metrics
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

register.registerMetric(httpRequestDuration);
register.registerMetric(adServeCount);
register.registerMetric(revenueTotal);
register.registerMetric(activeConnections);

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

const getMetrics = () => register.metrics();

module.exports = {
  metricsMiddleware,
  getMetrics,
  adServeCount,
  revenueTotal,
  activeConnections
};
