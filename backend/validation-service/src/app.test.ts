import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { Server } from 'node:http';
import { app } from './app.js';

let server: Server;
let baseUrl: string;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Invalid test address');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(() => new Promise<void>((resolve) => server.close(() => resolve())));

test('health returns the validation service identity', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'validation-service' });
});

test('unknown routes are not presented as healthy', async () => {
  const response = await fetch(`${baseUrl}/missing`);
  assert.equal(response.status, 404);
});

