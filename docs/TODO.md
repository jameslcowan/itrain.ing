# TODO and roadmap

Living backlog for the **Panax** platform monorepo (panax.ai + `.ing` product sites). See [MONOREPO.md](MONOREPO.md) and [PANAX-VISION.md](PANAX-VISION.md).

## Done recently

- [x] Marketing landing, blog SSG, FAQ (full content + `/faq/`)
- [x] Terms, privacy, shared footer on marketing pages
- [x] `/programs/` template library (grid layout, square cards, fluid columns)
- [x] Custom `404.html`
- [x] Netlify removed from monorepo (DO + Caddy only)
- [x] Micro-commit Cursor rule (`.cursor/rules/micro-commits.mdc`)
- [x] A11y fixes (skip link, labels, Escape, reduced motion)
- [x] Share dialog no longer auto-closes on copy
- [x] Analytics schema (3NF) — [ANALYTICS-SCHEMA.md](ANALYTICS-SCHEMA.md)
- [x] Analytics migrations `002`–`009` + PostgREST RPCs
- [x] `scripts/smoke-api.sh` pre-DNS API tests

## CI failures (auto-tracked)

Open items from failed runs: **[CI-TODO.md](CI-TODO.md)** and GitHub issues labeled `ci-todo`.  
**CI** workflow must pass on push; deploy is manual unless `AUTO_DEPLOY=true` — [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md).

## Now — infrastructure (DigitalOcean + monorepo)

- [x] **Phase 0:** DO droplet + Caddy (five sites live on IP)
- [ ] **Phase 0:** GitHub Actions deploy verified (secrets + manual workflow) — [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md)
- [ ] DNS cutover all `.ing` domains — **hold** until tested — [DNS.md](DNS.md)
- [ ] **itrain.ing** Porkbun A `@` + `www` → `137.184.37.56` (never done; site only on droplet + pre-DNS curl)
- [x] **Phase 1:** GitHub repo / clone → `jameslcowan/panax`, `~/panax`
- [x] **Phase 2:** App under `sites/powerlifting/` (+ sister copies) — [MONOREPO.md](MONOREPO.md)
- [x] **Phase 3:** Matrix deploy workflow in repo
- [x] **Phase 5:** Analytics schema + migrations — [ANALYTICS-IMPLEMENTATION.md](ANALYTICS-IMPLEMENTATION.md)
- [x] Postgres + PostgREST **applied and smoke-tested on droplet** (`install-analytics-stack.sh`)
- [ ] Shut down legacy Netlify powerlift repo/site after DNS verified

## Now — ops and verification

- [ ] Google Search Console: verify site, submit `sitemap.xml`
- [ ] Cross-browser / mobile smoke test (Chrome, Firefox, Safari, iOS, Android)
- [ ] Load time check on `/` and `/programs/` (target &lt; 2s on mobile)

## Programs library

- [ ] Remove or hide **test** templates (`test-*` in `content/programs-data.js`) before broad launch
- [ ] Curate production templates (real names, descriptions, multi-week blocks where needed)
- [ ] Optional: `custom` analytics events — `program_card_open`, `open_in_builder` with `template_id`
- [ ] README / landing copy: point users at `/programs/` as the starter path

## Product and UX

- [ ] Share button polish (checkmark state vs dialog — see historical notes in repo if needed)
- [ ] First-visit hint or short “how sharing works” nudge in app (localStorage)
- [ ] Example programs linked from landing or menu (2–3 real templates, not grid fillers)
- [ ] Decide fate of AI helper files (`ai.txt`, `llms.txt`, `.well-known/*`) — simplify or remove
- [ ] Support / contact path (GitHub issues link in footer or dedicated page)

## Analytics (DO droplet / Postgres)

- [x] DB schema + PostgREST RPCs in repo
- [x] Droplet: install Postgres/PostgREST + `./scripts/smoke-api.sh`
- [ ] Front-end beacon per site (after privacy policy) — `packages/analytics/`
- [x] NocoDB visual admin (optional) — [NOCODB.md](NOCODB.md)
- [ ] Admin sign-in and dashboard (product UI; separate from NocoDB)
- [ ] Funnel: landing → `/programs/` → `/app` (normalize `/app` paths in events)

## Marketing and launch

- [ ] 2–3 screenshots or a 30s demo clip for social posts
- [ ] Soft launch: friends, training partners, coaches
- [ ] Community posts when ready (Reddit r/powerlifting, r/weightroom, forums) — lead with `/programs/` + blank app
- [ ] Collect 3–5 short testimonials for landing or FAQ

### Forum post angle (short)

> Free powerlifting program builder — entire program in one link. Templates at powerlift.ing/programs/ or start blank. No signup.

## Future / backlog

- [ ] Saved programs / accounts (optional premium later)
- [ ] Private or coach-only program links (paid tier idea)
- [ ] Shorter custom URLs for coaches
- [ ] More blog articles (periodization, sharing, meet prep)
- [ ] PWA “add to home screen” callout in FAQ or app menu
- [ ] Extract shared analytics package if a third site needs the same pipeline

## Superseded plans

Superseded: early planning notes (Ghost landing, menu dropdowns, pre-SSG FAQ paths) are removed; this file replaces them.
