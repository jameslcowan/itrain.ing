# itrain.ing documentation

Monorepo docs: suite plan, deploy, and powerlift.ing product details.

**Context from prior workspace:** [HANDOFF.md](HANDOFF.md)

| Doc | Purpose |
|-----|---------|
| [SITE.md](SITE.md) | Architecture, routes, build pipeline, local dev, Netlify deploy |
| [DEPLOY.md](DEPLOY.md) | DigitalOcean droplet, GitHub Actions, DNS cutover |
| [MONOREPO.md](MONOREPO.md) | itrain.ing monorepo plan (phases, tree, DB sketch) |
| [SUITE.md](SUITE.md) | Site roster and migration summary |
| [ANALYTICS.md](ANALYTICS.md) | Analytics status (Netlify removed; Hetzner planned) |
| [BLOG.md](BLOG.md) | Adding articles, frontmatter, SSG output |
| [SEO.md](SEO.md) | Positioning, indexing rules, URL contract |
| [TODO.md](TODO.md) | Prioritized backlog and launch checklist |

## Quick commands

```bash
npm install
npm run build              # blog + faq + legal + programs + 404.html
python scripts/dev-server.py   # :8080 — SPA routes + custom 404
node --test tests/codec.test.mjs
```

## Repo layout (high level)

| Path | Role |
|------|------|
| `index.html` | Marketing landing (hand-edited; footer patched by `legal/build.mjs`) |
| `app.html`, `app.js`, `state-codec.js` | Program builder |
| `content/` | FAQ data, program templates, blog articles |
| `blog/`, `faq/`, `legal/`, `programs/`, `site/` | Static page generators |
| `404.html` | Generated; Netlify serves for missing URLs |
| `sites/` | Scaffold folders for olympiclift.ing, powerbuild.ing, bootybuild.ing |
