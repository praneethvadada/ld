import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { createApp } from '../src/app.js';
import { loadParticipants } from '../src/models/participants.js';

const SAMPLE = `
Praneeth,9876543210,true
Rahul,9876543211,false
`;

function startServer(rateLimit) {
  const app = createApp({ corsOrigins: ['http://localhost:5173'], rateLimit, trustProxy: false });
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

function check(baseUrl, body, headers = { 'Content-Type': 'application/json' }) {
  return fetch(`${baseUrl}/api/lucky-draw/check`, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/lucky-draw/check', () => {
  let server;
  let baseUrl;

  before(async () => {
    loadParticipants(SAMPLE);
    ({ server, baseUrl } = await startServer({ windowMs: 60_000, max: 100 }));
  });

  after(() => server.close());

  test('returns the winner result', async () => {
    const response = await check(baseUrl, { phoneNumber: '9876543210' });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, found: true, winner: true, name: 'Praneeth' });
  });

  test('returns the non-winner result', async () => {
    const response = await check(baseUrl, { phoneNumber: '9876543211' });

    assert.deepEqual(await response.json(), { success: true, found: true, winner: false, name: 'Rahul' });
  });

  test('returns not found without leaking anything else', async () => {
    const response = await check(baseUrl, { phoneNumber: '9000000000' });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, found: false, winner: false });
  });

  test('matches a number however it is written', async () => {
    for (const phoneNumber of ['+919876543210', '+91 98765 43210', '09876543210', 9876543210]) {
      const data = await (await check(baseUrl, { phoneNumber })).json();
      assert.equal(data.name, 'Praneeth', `failed for ${phoneNumber}`);
    }
  });

  test('rejects invalid and missing phone numbers', async () => {
    const bodies = [{}, { phoneNumber: '' }, { phoneNumber: '12345' }, { phoneNumber: null }, { phoneNumber: { $ne: '' } }];

    for (const body of bodies) {
      const response = await check(baseUrl, body);
      const data = await response.json();
      assert.equal(response.status, 400, JSON.stringify(body));
      assert.equal(data.success, false);
      assert.equal(data.error, 'INVALID_PHONE');
    }
  });

  test('answers malformed JSON with a clean 400', async () => {
    const response = await check(baseUrl, '{"phoneNumber": ');
    const data = await response.json();

    assert.equal(response.status, 400);
    assert.equal(data.error, 'INVALID_REQUEST');
    assert.equal(JSON.stringify(data).includes('SyntaxError'), false);
  });

  test('refuses oversized request bodies', async () => {
    const response = await check(baseUrl, { phoneNumber: '9'.repeat(5000) });

    assert.equal(response.status, 413);
    assert.equal((await response.json()).error, 'INVALID_REQUEST');
  });

  test('does not expose a participant list', async () => {
    for (const path of ['/api/lucky-draw', '/api/lucky-draw/participants', '/api/participants']) {
      const response = await fetch(`${baseUrl}${path}`);
      assert.equal(response.status, 404, path);
    }
  });

  test('marks results as not cacheable and hides the framework', async () => {
    const response = await check(baseUrl, { phoneNumber: '9876543210' });

    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-powered-by'), null);
  });

  test('only allows the configured website origin', async () => {
    const allowed = await check(baseUrl, { phoneNumber: '9876543210' }, {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:5173',
    });
    const other = await check(baseUrl, { phoneNumber: '9876543210' }, {
      'Content-Type': 'application/json',
      Origin: 'https://evil.example',
    });

    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.equal(other.headers.get('access-control-allow-origin'), null);
  });

  test('reports health', async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    assert.deepEqual(await response.json(), { status: 'ok' });
  });
});

describe('rate limiting', () => {
  let server;
  let baseUrl;

  before(async () => {
    loadParticipants(SAMPLE);
    ({ server, baseUrl } = await startServer({ windowMs: 60_000, max: 3 }));
  });

  after(() => server.close());

  test('blocks an IP after the allowed number of checks', async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      assert.equal((await check(baseUrl, { phoneNumber: '9876543210' })).status, 200);
    }

    const blocked = await check(baseUrl, { phoneNumber: '9876543210' });
    const data = await blocked.json();

    assert.equal(blocked.status, 429);
    assert.equal(data.error, 'RATE_LIMITED');
    assert.ok(blocked.headers.get('retry-after'));
  });
});
