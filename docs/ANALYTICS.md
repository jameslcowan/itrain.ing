# Analytics

Netlify analytics (Blob ingest, scheduled rollup, dashboard functions) was **removed** from this repo in favor of a shared **Hetzner** stack for the lifting-apps suite.

## Current state

- No `analytics.js` on site pages
- No `netlify/functions/` analytics endpoints
- Privacy policy reflects hosting logs only until a replacement is live

## Planned (Hetzner)

- One VPS serving multiple domains (`powerlift.ing`, `olympiclift.ing`, `powerbuild.ing`, …)
- Central ingest + database (Postgres or similar) — not Netlify Blobs
- Single admin dashboard across properties

Track implementation in [TODO.md](TODO.md) under analytics / infrastructure.
