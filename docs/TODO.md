# TODO and roadmap

Living backlog for the itrain.ing monorepo (powerlift.ing and sister sites). See [MONOREPO.md](MONOREPO.md) for phased migration.

## Done recently

- [x] Marketing landing, blog SSG, FAQ (full content + `/faq/`)
- [x] Terms, privacy, shared footer on marketing pages
- [x] `/programs/` template library (grid layout, square cards, fluid columns)
- [x] Custom `404.html`
- [x] ~~Netlify analytics~~ (removed — moving to Hetzner suite stack)
- [x] Micro-commit Cursor rule (`.cursor/rules/micro-commits.mdc`)
- [x] A11y fixes (skip link, labels, Escape, reduced motion)
- [x] Share dialog no longer auto-closes on copy

## Now — infrastructure (DigitalOcean + monorepo)

- [ ] **Phase 0:** DO droplet + Caddy + GitHub Actions deploy (repo root) — [DEPLOY.md](DEPLOY.md)
- [ ] DNS cutover powerlift.ing; keep Netlify as rollback until smoke tests pass
- [ ] **Phase 1:** Rename GitHub repo → `itrain.ing`
- [ ] **Phase 2:** Move app to `sites/powerlift.ing/` — [MONOREPO.md](MONOREPO.md)
- [ ] **Phase 3:** Matrix deploy per site
- [ ] Design analytics ingest + DB schema (`site_id`) — **Phase 5**
- [ ] Remove obsolete Netlify analytics env vars from Netlify UI after deploy

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

- [ ] `services/analytics/` ingest API on VPS
- [ ] Admin sign-in and dashboard
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
