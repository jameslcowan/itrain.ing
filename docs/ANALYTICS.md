# Analytics

First-party pipeline (parallel to [jameslcowan](https://github.com/jameslcowan/jameslcowan)): browser → Netlify Blob queue → daily rollup → **GitHub API commit** → dashboard.

There is **no** `git push` from Netlify. Rollup creates commits on `main` via `GITHUB_TOKEN`; pull locally to sync.

## Flow

```text
analytics.js  →  collect-analytics  →  Blob (analytics-events)
                                              ↓
                         rollup-analytics @ 05:00 UTC
                                              ↓
                         analytics/YYYY/M/D/analytics-scheduled.json
                                              ↓
                         dashboard (reads GitHub) ← analytics-login
```

## Netlify setup (required once)

**Site → Project configuration → Environment variables**, then **redeploy**.

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANALYTICS_ADMIN_TOKEN` | Yes | Dashboard password, manual rollup auth, optional `?token=` |
| `ANALYTICS_SALT` | Yes | Salt for IP hashing at ingest |
| `GITHUB_TOKEN` | Yes | PAT with **write** access to this repo |
| `GITHUB_ANALYTICS_REPO` | Yes | e.g. `jameslcowan/powerlift.ing` |
| `GITHUB_ANALYTICS_BRANCH` | No | Default `main` |

Optional: `BREVO_API_KEY`, `CONTACT_NOTIFY_EMAIL` for rollup alert emails.

`MANUAL_ROLLUP_TOKEN` works as an alias for `ANALYTICS_ADMIN_TOKEN`.

### After deploy, verify

1. **Functions → Scheduled** lists `rollup-analytics` (cron `0 5 * * *` UTC is defined in code — no extra `netlify.toml` cron).
2. Visit `/programs/` → Network → `collect-analytics` → **204**.
3. Open `https://powerlift.ing/.netlify/functions/analytics-login` → sign in → dashboard loads.
4. After traffic + rollup: new commit under `analytics/…` on GitHub.

Scheduled functions require a Netlify plan that supports them (same as jameslcowan).

## URLs

| URL | Purpose |
|-----|---------|
| `/.netlify/functions/analytics-login` | **Bookmark this** — sign-in form, 30-day session cookie |
| `/.netlify/functions/dashboard` | Traffic report (requires session or `?token=`) |
| `/.netlify/functions/collect-analytics` | Ingest (used by `analytics.js`) |

## Client behavior

- Loaded on landing, blog, FAQ, programs, legal, terms, and `/app`.
- Events: `page_view`, `link_click`.
- Shared program URLs are reported as path **`/app`** only (encoded state never sent).
- DNT: server returns `204` and does not store when `DNT: 1`.
- `localStorage` key `pl-analytics-visitor` (hashed before upload). Disclosed in [privacy policy](/privacy/).

## Rollup output

```
analytics/{year}/{month}/{day}/analytics-scheduled.json
analytics/{year}/{month}/{day}/analytics-manual.json
```

Month/day folders are **not** zero-padded. Files include `meta`, `traffic`, `performance`, and raw `events`.

## Manual rollup

Before the first scheduled run, or to backfill a day:

```bash
ANALYTICS_ADMIN_TOKEN=secret ROLLUP_SITE_URL=https://powerlift.ing npm run rollup:trigger
# optional date:
npm run rollup:trigger -- 2026-05-20
```

## Source files

| File | Role |
|------|------|
| `analytics.js` | Browser collector |
| `netlify/functions/collect-analytics.js` | Ingest |
| `netlify/functions/rollup-analytics.js` | Scheduled rollup |
| `netlify/functions/rollup-analytics-manual.js` | Manual rollup entry |
| `netlify/functions/analytics-login.js` | Sign-in |
| `netlify/functions/dashboard.js` | Dashboard HTML |
| `scripts/manual-rollup.mjs` | CLI trigger |
