# Security hardening — Panax droplet

Checklist for the DigitalOcean production VPS. Apply via `infra/server/*.sh` scripts and tracked config in this repo.

**Admin user:** `jameslcowan` (sudo, SSH key)  
**Deploy user:** `deploy` (CI rsync only)  
**Droplet IP:** `137.184.37.56`

## Phase 0 — Sync

- [ ] `origin/main` includes multi-site deploy + hardening commits (push pending deploy key)
- [ ] GitHub deploy key (write) added for droplet push — see [GITHUB-PUSH.md](GITHUB-PUSH.md)
- [x] This document committed

## Phase 1 — Deploy surface

- [x] `infra/deploy/rsync-excludes.txt` excludes dev artifacts
- [x] Redeploy all sites; `package.json` removed from `/var/www` (404 via Caddy)
- [x] Landing `/` still 200 (all five hosts)

## Phase 2 — Server hygiene

- [x] `fail2ban` active for `sshd`
- [x] `exim4` disabled
- [x] `/home/deploy/.ssh/deploy_key` (private) removed from server
- [x] `/root/DEPLOY-SECRETS.txt` removed
- [ ] GitHub Actions deploy verified after key cleanup (re-run workflow after push)

## Phase 3 — SSH tuning (non-disruptive)

- [x] `/etc/ssh/sshd_config.d/99-itrain-hardening.conf` applied
- [x] `sshd -t` passes

## Phase 4 — Admin user & root SSH

- [x] `jameslcowan` exists, sudo, SSH key matches root/Fedora key
- [ ] Cursor/SSH works as `jameslcowan@137.184.37.56` (confirm from your machine)
- [x] `PermitRootLogin no` applied
- [x] `deploy` batch SSH succeeds

## Phase 6 — Smoke test (all domains)

Run after DNS points to droplet (or with `curl -H "Host: …"` to the droplet IP — **itrain.ing DNS not set yet**):

| URL | Expected |
|-----|----------|
| `https://powerlift.ing/` | 200 |
| `https://powerbuild.ing/` | 200 |
| `https://olympiclift.ing/` | 200 |
| `https://bootybuild.ing/` | 200 |
| `https://itrain.ing/` | 200 |
| `…/package.json` | 404 |
| Unknown path | 404 page |

## Verification log

| Date | Who | Notes |
|------|-----|-------|
| 2026-05-26 | Agent | Hardening applied on droplet; root SSH disabled; push blocked until `github_push` deploy key added |

## Optional (not in default rollout)

- [ ] SSH port change
- [ ] `AllowUsers` restriction
- [ ] `rrsync` / `ForceCommand` for `deploy`
- [ ] DO weekly snapshots
