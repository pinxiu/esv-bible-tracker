const ESV_API_ORIGIN = 'https://api.esv.org';
const GITHUB_API_ORIGIN = 'https://api.github.com';
const MAX_FEEDBACK_BYTES = 8 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store'
};

function json(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
}

function cleanQuery(value, maxLength = 160) {
  const result = String(value || '').trim();
  if (!result || result.length > maxLength) throw new Error('Invalid or oversized query.');
  return result;
}

async function rateLimit(request, env, route) {
  if (!env.API_RATE_LIMITER) return true;
  const client = request.headers.get('CF-Connecting-IP') || 'unknown';
  const result = await env.API_RATE_LIMITER.limit({ key: `${client}:${route}` });
  return result.success;
}

async function proxyEsv(url, env) {
  if (!env.ESV_API_TOKEN) return json({ error: 'ESV service is not configured.' }, 503);
  const response = await fetch(url, {
    headers: { Authorization: `Token ${env.ESV_API_TOKEN}` }
  });
  const headers = new Headers(corsHeaders);
  headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
  return new Response(response.body, { status: response.status, headers });
}

function githubHeaders(env) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${env.GITHUB_FEEDBACK_TOKEN}`,
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'ESV-Bible-Tracker-Feedback-Service'
  };
}

async function githubRequest(path, env, options = {}) {
  return fetch(`${GITHUB_API_ORIGIN}${path}`, {
    ...options,
    headers: { ...githubHeaders(env), ...(options.headers || {}) }
  });
}

async function ensureFeedbackBranch(env, repository, branch) {
  const branchResponse = await githubRequest(`/repos/${repository}/git/ref/heads/${branch}`, env);
  if (branchResponse.ok) return;
  if (branchResponse.status !== 404) throw new Error('Could not inspect feedback storage.');

  const mainResponse = await githubRequest(`/repos/${repository}/git/ref/heads/main`, env);
  if (!mainResponse.ok) throw new Error('Could not read the main branch.');
  const main = await mainResponse.json();
  const createResponse = await githubRequest(`/repos/${repository}/git/refs`, env, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: main.object.sha })
  });
  if (!createResponse.ok && createResponse.status !== 422) {
    throw new Error('Could not create feedback storage.');
  }
}

function utf8ToBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

async function uploadGithubFile(env, repository, branch, path, content, message, contentIsBase64 = false) {
  const response = await githubRequest(`/repos/${repository}/contents/${path}`, env, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: contentIsBase64 ? content : utf8ToBase64(content),
      branch
    })
  });
  if (!response.ok) throw new Error(`Could not save feedback file (${response.status}).`);
}

function sanitizeFilename(value, fallback) {
  const result = String(value || fallback).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
  return result || fallback;
}

async function submitFeedback(request, env) {
  if (!env.GITHUB_FEEDBACK_TOKEN) return json({ error: 'Feedback service is not configured.' }, 503);
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_FEEDBACK_BYTES) return json({ error: 'Feedback upload is too large.' }, 413);

  const payload = await request.json();
  const title = cleanQuery(payload.title, 120);
  const body = cleanQuery(payload.body, 10000);
  const attachments = Array.isArray(payload.attachments)
    ? payload.attachments.slice(0, MAX_ATTACHMENTS)
    : [];
  if (JSON.stringify(payload).length > MAX_FEEDBACK_BYTES) {
    return json({ error: 'Feedback upload is too large.' }, 413);
  }

  const repository = env.GITHUB_REPOSITORY || 'pinxiu/esv-bible-tracker';
  const branch = env.FEEDBACK_BRANCH || 'app-feedback';
  await ensureFeedbackBranch(env, repository, branch);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  let finalBody = body;
  for (let index = 0; index < attachments.length; index += 1) {
    const attachment = attachments[index];
    const match = String(attachment?.data || '').match(/^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) continue;
    const name = sanitizeFilename(attachment.name, `attachment-${index + 1}`);
    const repoPath = `feedback/attachments/${stamp}-${index + 1}-${name}`;
    await uploadGithubFile(
      env,
      repository,
      branch,
      repoPath,
      match[2],
      'Upload ESV Bible Tracker feedback attachment [skip ci]',
      true
    );
    const rawUrl = `https://raw.githubusercontent.com/${repository}/${branch}/${repoPath}`;
    finalBody += attachment.isImage
      ? `\n\n![${name}](${rawUrl})`
      : `\n\n[${name}](${rawUrl})`;
  }

  const submissionPath = `feedback/submissions/${stamp}.md`;
  await uploadGithubFile(
    env,
    repository,
    branch,
    submissionPath,
    `# ${title}\n\n${finalBody}\n`,
    'Save ESV Bible Tracker feedback submission [skip ci]'
  );

  const issueBody = `${finalBody}\n\n---\n[Repository feedback copy](https://github.com/${repository}/blob/${branch}/${submissionPath})`;
  const issueResponse = await githubRequest(`/repos/${repository}/issues`, env, {
    method: 'POST',
    body: JSON.stringify({ title, body: issueBody })
  });
  if (!issueResponse.ok) throw new Error(`Could not create feedback issue (${issueResponse.status}).`);
  const issue = await issueResponse.json();
  return json({ success: true, url: issue.html_url, submissionPath });
}

export default {
  async fetch(request, env) {
    try {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
      const url = new URL(request.url);
      const route = `${request.method} ${url.pathname}`;
      if (!(await rateLimit(request, env, route))) return json({ error: 'Too many requests. Please try again shortly.' }, 429);

      if (request.method === 'GET' && url.pathname === '/health') {
        return json({ ok: true, esv: Boolean(env.ESV_API_TOKEN), feedback: Boolean(env.GITHUB_FEEDBACK_TOKEN) });
      }

      if (request.method === 'GET' && url.pathname === '/v1/esv/search') {
        const query = cleanQuery(url.searchParams.get('q'));
        const pageSize = Math.min(20, Math.max(1, Number(url.searchParams.get('page-size')) || 20));
        return proxyEsv(`${ESV_API_ORIGIN}/v3/passage/search/?q=${encodeURIComponent(query)}&page-size=${pageSize}`, env);
      }

      if (request.method === 'GET' && url.pathname === '/v1/esv/html') {
        const query = cleanQuery(url.searchParams.get('q'));
        const params = new URLSearchParams({
          q: query,
          'include-footnotes': 'true',
          'include-footnote-body': 'true',
          'include-headings': 'true',
          'include-audio-link': 'false'
        });
        return proxyEsv(`${ESV_API_ORIGIN}/v3/passage/html/?${params}`, env);
      }

      if (request.method === 'GET' && url.pathname === '/v1/esv/audio') {
        const query = cleanQuery(url.searchParams.get('q'));
        return proxyEsv(`${ESV_API_ORIGIN}/v3/passage/audio/?q=${encodeURIComponent(query)}`, env);
      }

      if (request.method === 'POST' && url.pathname === '/v1/feedback') {
        return await submitFeedback(request, env);
      }

      return json({ error: 'Not found.' }, 404);
    } catch (error) {
      return json({ error: error.message || 'Unexpected service error.' }, 400);
    }
  }
};
