# powerlift.ing

Free powerlifting program builder — **the whole program lives in one shareable URL**.

## Documentation

All project docs live in **[docs/](docs/README.md)**:

| Doc | Topic |
|-----|--------|
| [docs/SITE.md](docs/SITE.md) | Routes, build, deploy, repo layout |
| [docs/ANALYTICS.md](docs/ANALYTICS.md) | Analytics (Hetzner planned; Netlify removed) |
| [docs/BLOG.md](docs/BLOG.md) | Writing and publishing articles |
| [docs/SEO.md](docs/SEO.md) | Indexing and positioning |
| [docs/TODO.md](docs/TODO.md) | Backlog and launch checklist |
| [docs/SUITE.md](docs/SUITE.md) | Sister sites under `sites/` |

## Quick start

```bash
npm install
npm run build
python scripts/dev-server.py   # http://127.0.0.1:8080
```

```bash
node --test tests/codec.test.mjs
```

## What ships

- **/** — marketing landing
- **/app** — builder (SPA; shared `/app/<STATE>` links are noindex)
- **/programs/** — free template library
- **/blog/**, **/faq/**, **/terms/**, **/privacy/**
- **404.html** — branded not-found page

Netlify: `npm ci && npm run build`, publish `.`. Details in [docs/SITE.md](docs/SITE.md). Site deploy stays on Netlify until Hetzner cutover.

## Suite (itrain.ing)

Monorepo plan: [docs/MONOREPO.md](docs/MONOREPO.md). Sister sites: [`sites/`](sites/) (olympiclift.ing, powerbuild.ing, bootybuild.ing). Roster: [docs/SUITE.md](docs/SUITE.md).
