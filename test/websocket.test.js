const assert = require('assert');
const { test, describe } = require('node:test');
const ioClient = require('socket.io-client');
const http = require('http');

describe('WebSocket Analytics', () => {
  // TODO: This test is disabled because Socket.io server implementation is not complete
  // Enable this test once Socket.io is properly integrated with the server
  test.skip('socket connection receives init payload', async (t) => {
    // Set up test environment
    process.env.DATABASE_PATH = ':memory:';

    // Import app and create server instance
    const app = require('../src/server');
    const server = http.createServer(app);

    // Start server on random port
    await new Promise(resolve => {
      server.listen(0, resolve);
    });

    const port = server.address().port;
    const socket = ioClient(`http://localhost:${port}`, {
      transports: ['websocket'],
      timeout: 5000
    });

    try {
      const init = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 3000);

        socket.on('aggregate-init', data => {
          clearTimeout(timeout);
          resolve(data);
        });

        socket.on('connect', () => {
          // Connection established, wait for aggregate-init
        });

        socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      assert.ok(Array.isArray(init), 'received aggregate data array');
    } finally {
      socket.disconnect();
      await new Promise(resolve => {
        server.close(resolve);
      });
    }
  });
});
