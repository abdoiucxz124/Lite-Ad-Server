const assert = require('assert');
const { describe, test, before } = require('node:test');
const request = require('supertest');

let app;

describe('Integration Tests', () => {
  before(() => {
    process.env.DATABASE_PATH = ':memory:';
    process.env.ADMIN_PASSWORD = '';
    app = require('../src/server');
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  test('GET /api/ad serves script', async () => {
    const res = await request(app).get('/api/ad').query({ slot: 'test-slot' });
    assert.strictEqual(res.statusCode, 200);
    assert.match(res.text, /LiteAdServer.loadAd/);
  });

  test('POST /api/track saves event', async () => {
    const res = await request(app)
      .post('/api/track')
      .send({ slot: 'test-slot', event: 'impression' });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.success);
  });

  test('GET /admin/health returns healthy', async () => {
    const res = await request(app).get('/admin/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });

  test('GET /admin/data summary', async () => {
    const res = await request(app).get('/admin/data');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
  });

  test('GET unknown route returns 404', async () => {
    const res = await request(app).get('/does-not-exist');
    assert.strictEqual(res.statusCode, 404);
  });
});
