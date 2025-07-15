const assert = require('assert');
const { test, describe } = require('node:test');
const ioClient = require('socket.io-client');

describe('WebSocket Analytics', () => {
  test('socket connection receives init payload', async (t) => {
    process.env.PORT = 0;
    const { server } = require('../src/server');
    const port = server.address().port;
    const socket = ioClient(`http://localhost:${port}`, { transports: ['websocket'] });

    const init = await new Promise(resolve => {
      socket.on('aggregate-init', data => resolve(data));
      socket.on('connect', () => {});
    });

    assert.ok(Array.isArray(init), 'received aggregate data array');

    socket.disconnect();
    server.close();
  });
});
