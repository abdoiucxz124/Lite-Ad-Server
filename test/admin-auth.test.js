const assert = require('assert');
const { test, describe } = require('node:test');
const session = require('supertest-session');
const path = require('path');

process.env.DATABASE_PATH = path.join(__dirname, '../data/test.db');
process.env.ADMIN_PASSWORD_HASH = '$2b$10$abcdefghijklmnopqrstuv';
process.env.SESSION_SECRET = 'testsecret';

const app = require('../src/server');

describe('Admin Authentication', () => {
  test('rejects invalid login', async () => {
    const agent = session(app);
    const res = await agent.post('/admin/login').send({ username: 'admin', password: 'wrong' });
    assert.strictEqual(res.statusCode, 401);
  });
});
