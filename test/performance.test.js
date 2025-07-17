const assert = require('assert');
const { describe, test, before } = require('node:test');
const { performance } = require('perf_hooks');
const request = require('supertest');

let app;

describe('Performance Tests', () => {
  before(() => {
    process.env.DATABASE_PATH = ':memory:';
    app = require('../src/server');
  });

  test('ad endpoint handles load quickly', async () => {
    const startMem = process.memoryUsage().heapUsed;
    const start = performance.now();
    const requests = Array.from({ length: 20 }, () =>
      request(app).get('/api/ad').query({ slot: 'load-slot' })
    );
    await Promise.all(requests);
    const duration = performance.now() - start;
    const endMem = process.memoryUsage().heapUsed;
    assert.ok(duration < 2000, `duration ${duration}`);
    assert.ok(endMem - startMem < 50 * 1024 * 1024, 'memory usage within limits');
  });
});
