const assert = require('assert');
const { test } = require('node:test');
const { startServer } = require('../src/server');

const requestAd = async (base) => {
  const res = await fetch(`${base}/api/ad?slot=22904833613/test`);
  return res;
};

const requestStats = async (base) => {
  const res = await fetch(`${base}/admin/stats`);
  return res;
};

test('ad endpoint responds under 200ms', async () => {
  const server = startServer(0);
  const port = server.address().port;
  const url = `http://localhost:${port}`;
  const start = Date.now();
  const res = await requestAd(url);
  const duration = Date.now() - start;
  assert.strictEqual(res.status, 200);
  assert.ok(duration < 200, `response took ${duration}ms`);
  server.close();
});

test('stats endpoint responds under 300ms', async () => {
  const server = startServer(0);
  const port = server.address().port;
  const url = `http://localhost:${port}`;
  const start = Date.now();
  const res = await requestStats(url);
  const duration = Date.now() - start;
  assert.strictEqual(res.status, 200);
  assert.ok(duration < 300, `response took ${duration}ms`);
  server.close();
});
