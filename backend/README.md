# Secure API Gateway

The desktop app must never receive an ESV API key, GitHub token, signing key, or
other reusable credential. This Cloudflare Worker performs the small set of
allowed upstream operations on the app's behalf.

## Secrets

Configure these as encrypted Worker secrets:

- `ESV_API_TOKEN`
- `GITHUB_FEEDBACK_TOKEN`

The GitHub token should be fine-grained, limited to
`pinxiu/esv-bible-tracker`, with only **Contents: Read and write** and
**Issues: Read and write**. Do not reuse a personal full-repository token.

```bash
cd backend
npx wrangler secret put ESV_API_TOKEN
npx wrangler secret put GITHUB_FEEDBACK_TOKEN
npx wrangler deploy
```

For local development, copy `.dev.vars.example` to `.dev.vars`. That file is
ignored by Git. Set the deployed URL as the repository Actions variable
`APP_API_BASE_URL`; the release build receives only that public URL.

## Abuse controls

The Worker accepts only four fixed routes, validates query/body sizes, caps
attachments, and applies a rate limiter. Before public launch, also configure a
Cloudflare WAF rate-limit rule and billing/usage alerts. A public desktop app
cannot keep an embedded client credential secret, so server-side quotas and
monitoring—not an app-side “secret”—must protect the gateway.
