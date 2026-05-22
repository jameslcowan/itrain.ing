# Analytics (powerlift.ing)

First-party analytics on Netlify: browser collector → Blob queue → daily rollup → GitHub snapshots → password-protected dashboard.

## Netlify environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANALYTICS_ADMIN_TOKEN` | Yes | Dashboard sign-in password, manual rollup auth, optional `?token=` URL access |
| `ANALYTICS_SALT` | Yes | Salt for hashing visitor IPs at ingest |
| `GITHUB_TOKEN` | Yes | Read/write rollup JSON in repo |
| `GITHUB_ANALYTICS_REPO` | Yes | e.g. `jameslcowan/powerlift.ing` |
| `GITHUB_ANALYTICS_BRANCH` | No | Default `main` |
| `BREVO_API_KEY` | No | Optional alert emails on rollup |
| `CONTACT_NOTIFY_EMAIL` | No | Alert recipient |

`MANUAL_ROLLUP_TOKEN` is accepted as a fallback alias for `ANALYTICS_ADMIN_TOKEN`.

## URLs (production)

| URL | Purpose |
|-----|---------|
| `/.netlify/functions/analytics-login` | Sign in (sets 30-day session cookie) |
| `/.netlify/functions/dashboard` | Traffic dashboard (requires sign-in or `?token=`) |
| `/.netlify/functions/collect-analytics` | Ingest (called by `analytics.js`) |

Bookmark **analytics-login** for daily use.

## Client

- `analytics.js` on marketing pages and `/app` (shared URLs reported as path `/app` only).
- Honors browser DNT on the server; uses `localStorage` visitor id (hashed before send).

## Rollup

- Scheduled: daily `05:00` UTC via `rollup-analytics`
- Manual: `npm run rollup:trigger` (see `scripts/manual-rollup.mjs`)
- Output: `analytics/YYYY/M/D/analytics-scheduled.json` (and `-manual.json`)

## Local CLI

```bash
ANALYTICS_ADMIN_TOKEN=secret ROLLUP_SITE_URL=https://powerlift.ing npm run rollup:trigger
```

## Verification after deploy

1. Visit `/programs/` — confirm `collect-analytics` returns `204` in Network tab.
2. Sign in at `/.netlify/functions/analytics-login`.
3. After events queue overnight, run manual rollup or wait for schedule; refresh dashboard.
