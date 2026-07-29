const configuredApiBaseUrl = (import.meta.env.VITE_APP_API_BASE_URL || '').trim().replace(/\/+$/, '');

export function hasAppApi() {
  return configuredApiBaseUrl.length > 0;
}

export async function fetchFromAppApi(path, options = {}) {
  if (!hasAppApi()) {
    throw new Error('The secure online service is not configured for this build.');
  }

  const response = await fetch(`${configuredApiBaseUrl}${path}`, options);
  if (!response.ok) {
    let message = `Online service failed (${response.status}).`;
    try {
      const payload = await response.json();
      if (payload?.error) message = payload.error;
    } catch {}
    throw new Error(message);
  }
  return response;
}

export async function submitAppFeedback(title, body, attachments) {
  const response = await fetchFromAppApi('/v1/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, attachments })
  });
  return response.json();
}
