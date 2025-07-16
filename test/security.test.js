const assert = require('assert');
const { describe, test, before } = require('node:test');
const request = require('supertest');

let app;

describe('Security Tests', () => {
  before(() => {
    process.env.DATABASE_PATH = ':memory:';
    process.env.RATE_LIMIT = '5';
    app = require('../src/server').app;
  });

  test('rejects invalid slot input', async () => {
    const res = await request(app).get('/api/ad').query({ slot: '<script>' });
    assert.strictEqual(res.statusCode, 400);
  });

  test('prevents SQL injection attempt', async () => {
    await request(app)
      .post('/api/track')
      .send({ slot: "'; DROP TABLE analytics;--", event: 'impression' });
    const res = await request(app)
      .post('/api/track')
      .send({ slot: 'safe-slot', event: 'impression' });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.success);
  });

  test('rate limiting works', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).get('/api/ad').query({ slot: 'rl-slot' });
    }
    const res = await request(app).get('/api/ad').query({ slot: 'rl-slot' });
    assert.strictEqual(res.statusCode, 429);
  });
});
