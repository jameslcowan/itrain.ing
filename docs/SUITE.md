# Lifting apps suite

Multiple static sites, one planned VPS (Hetzner) and shared analytics.

## Sites

| Site | Path | Status |
|------|------|--------|
| [powerlift.ing](https://powerlift.ing) | Repo root (`/`, `app.html`, …) | Live (Netlify) |
| olympiclift.ing | [`sites/olympiclift.ing/`](../sites/olympiclift.ing/) | Scaffold |
| powerbuild.ing | [`sites/powerbuild.ing/`](../sites/powerbuild.ing/) | Scaffold |
| bootybuild.ing | [`sites/bootybuild.ing/`](../sites/bootybuild.ing/) | Scaffold |

`powerlift.ing` remains at the repository root until a deliberate move into `sites/powerlift.ing/` (optional; preserves Netlify path and history).

## Shared later

- Design tokens / header-footer patterns (copy from root as each site ships)
- Analytics ingest + DB with per-site `site` id — see [ANALYTICS.md](ANALYTICS.md)
- Caddy vhosts and deploy script under `infra/` (not created yet)

## Adding a new site

1. Create `sites/<domain>/` with a README.
2. Clone or extract the powerlift.ing shell (landing, app, programs, build scripts).
3. Replace branding, `content/programs-data.js`, FAQ, and meta.
4. Register domain + vhost on the VPS.
