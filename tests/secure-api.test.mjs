import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from '../backend/src/worker.js';

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const appApi = await readFile(new URL('../src/services/appApi.js', import.meta.url), 'utf8');
const bibleApi = await readFile(new URL('../src/services/bibleApi.js', import.meta.url), 'utf8');
const workflow = await readFile(new URL('../.github/workflows/daily-release.yml', import.meta.url), 'utf8');
const security = await readFile(new URL('../SECURITY.md', import.meta.url), 'utf8');

test('desktop source contains only a public gateway URL, not reusable service tokens', () => {
  const desktopSource = `${app}\n${appApi}\n${bibleApi}\n${workflow}`;
  assert.match(appApi, /VITE_APP_API_BASE_URL/);
  assert.match(appApi, /https:\/\/esv-bible-tracker-api\.kwokp\.workers\.dev/);
  assert.doesNotMatch(desktopSource, /VITE_ESV_API_TOKEN|Authorization:\s*`Token|GITHUB_FEEDBACK_TOKEN/);
  assert.doesNotMatch(app, /esv_api_key|esvApiKey/);
  assert.match(security, /Vite variables are compiled into client JavaScript and are public/);
});

test('ESV gateway adds the publisher token only in the Worker request', async () => {
  const originalFetch = globalThis.fetch;
  let upstreamRequest;
  globalThis.fetch = async (url, options) => {
    upstreamRequest = { url: String(url), options };
    return new Response(JSON.stringify({ canonical: 'John 3:16', passages: ['ok'] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  };

  try {
    const response = await worker.fetch(
      new Request('https://gateway.test/v1/esv/html?q=John%203%3A16'),
      {
        ESV_API_TOKEN: 'server-only-test-token',
        API_RATE_LIMITER: { limit: async () => ({ success: true }) }
      }
    );
    assert.equal(response.status, 200);
    assert.match(upstreamRequest.url, /^https:\/\/api\.esv\.org\/v3\/passage\/html\//);
    assert.equal(upstreamRequest.options.headers.Authorization, 'Token server-only-test-token');
    assert.doesNotMatch(await response.text(), /server-only-test-token/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('gateway rejects oversized queries and rate-limited clients before upstream calls', async () => {
  const oversized = await worker.fetch(
    new Request(`https://gateway.test/v1/esv/search?q=${'x'.repeat(161)}`),
    { ESV_API_TOKEN: 'unused' }
  );
  assert.equal(oversized.status, 400);

  const limited = await worker.fetch(
    new Request('https://gateway.test/v1/esv/search?q=love'),
    { ESV_API_TOKEN: 'unused', API_RATE_LIMITER: { limit: async () => ({ success: false }) } }
  );
  assert.equal(limited.status, 429);
});
