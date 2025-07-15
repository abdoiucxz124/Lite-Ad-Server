const assert = require('assert');
const { test, describe, before, after } = require('node:test');
const express = require('express');

describe('Admin JWT auth', () => {
  let server;
  let port;

  before(() => {
    process.env.DATABASE_PATH = ':memory:';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'pass';
    process.env.JWT_SECRET = 'testsecret';
    // Initialize database in-memory
    require('../src/config');
    const { adminRouter, authRouter } = require('../src/routes/admin');
    const app = express();
    app.use(express.json());
    app.use('/admin', adminRouter);
    app.use('/api/auth', authRouter);
    server = app.listen(0);
    port = server.address().port;
  });

  after(() => {
    server.close();
  });

  test('login returns token and allows access', async () => {
    const loginRes = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'pass' })
    });
    assert.strictEqual(loginRes.status, 200);
    const data = await loginRes.json();
    assert.ok(data.token);

    const protectedRes = await fetch(`http://localhost:${port}/admin/health`, {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    assert.strictEqual(protectedRes.status, 200);
  });
});
