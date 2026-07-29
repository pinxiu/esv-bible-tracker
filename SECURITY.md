# Secret Handling

No reusable service credential may be bundled into ESV Bible Tracker, stored in
renderer source, supplied through a `VITE_*` secret, or copied into a packaged
application. Vite variables are compiled into client JavaScript and are public.

The desktop app contains only `VITE_APP_API_BASE_URL`, which is a public
configuration value. ESV and GitHub feedback credentials are encrypted secrets
on the server-side gateway in [`backend/`](backend/). Feedback files are stored
in a private Cloudflare R2 bucket, while the GitHub credential has only the
Issues permission needed to create the corresponding issue.

Release-only credentials—GitHub Actions tokens, the macOS signing `.p12` and its
password, and SMTP credentials—remain GitHub Actions secrets and are used only
on the release runner. They must never be passed to the Vite build.

If a token appears in a plaintext file, log, commit, screenshot, or packaged
asset, revoke it immediately, issue a replacement with the narrowest possible
permissions, and inspect repository history and release artifacts.

## Offline behavior

The bundled reading plan, progress, customized schedules, tutorial, settings,
memory practice, treasury, and embedded passage bank work without the gateway.
Official ESV formatting/search/audio, feedback submission, commentary web
pages, update checks/downloads, and Bible Gateway fallback require internet.
