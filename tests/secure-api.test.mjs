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

test('feedback stores files in R2 and uses GitHub only to create an issue', async () => {
  const originalFetch = globalThis.fetch;
  const objects = new Map();
  let githubRequest;
  const bucket = {
    async put(key, body, options = {}) {
      objects.set(key, { body, options });
    },
    async get(key) {
      const stored = objects.get(key);
      if (!stored) return null;
      return {
        body: stored.body,
        httpEtag: '"test-etag"',
        writeHttpMetadata(headers) {
          if (stored.options.httpMetadata?.contentType) {
            headers.set('Content-Type', stored.options.httpMetadata.contentType);
          }
        }
      };
    }
  };
  globalThis.fetch = async (url, options) => {
    githubRequest = { url: String(url), options };
    return new Response(JSON.stringify({ html_url: 'https://github.test/issues/1' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  };

  try {
    const response = await worker.fetch(
      new Request('https://gateway.test/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Gateway feedback',
          body: 'Stored in R2',
          attachments: [{
            name: 'note.txt',
            data: 'data:text/plain;base64,aGVsbG8=',
            isImage: false
          }]
        })
      }),
      {
        GITHUB_FEEDBACK_TOKEN: 'server-only-github-token',
        GITHUB_REPOSITORY: 'pinxiu/esv-bible-tracker',
        FEEDBACK_BUCKET: bucket
      }
    );
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.success, true);
    assert.equal(objects.size, 2);
    assert.ok([...objects.keys()].some(key => key.startsWith('attachments/')));
    assert.ok([...objects.keys()].some(key => key.startsWith('submissions/')));
    assert.equal(githubRequest.url, 'https://api.github.com/repos/pinxiu/esv-bible-tracker/issues');
    assert.equal(githubRequest.options.method, 'POST');
    assert.doesNotMatch(githubRequest.url, /contents|git\/ref/);
    assert.match(githubRequest.options.body, /gateway\.test\/v1\/feedback\/files\//);

    const storedResponse = await worker.fetch(
      new Request(`https://gateway.test/v1/feedback/files/${result.submissionPath}`),
      { FEEDBACK_BUCKET: bucket }
    );
    assert.equal(storedResponse.status, 200);
    assert.match(await storedResponse.text(), /Gateway feedback/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
