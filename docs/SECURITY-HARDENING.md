# Security hardening — itrain.ing droplet

Checklist for the DigitalOcean production VPS. Apply via `infra/server/*.sh` scripts and tracked config in this repo.

**Admin user:** `jameslcowan` (sudo, SSH key)  
**Deploy user:** `deploy` (CI rsync only)  
**Droplet IP:** `137.184.37.56`

## Phase 0 — Sync

- [ ] `origin/main` includes multi-site deploy workflow
- [ ] GitHub deploy key (write) added for droplet push — see [GITHUB-PUSH.md](GITHUB-PUSH.md)
- [x] This document committed

## Phase 1 — Deploy surface

- [ ] `infra/deploy/rsync-excludes.txt` excludes dev artifacts
- [ ] Redeploy all sites; `package.json` returns 404 on production URLs
- [ ] Landing `/`, `/programs/`, `/app` still 200

## Phase 2 — Server hygiene

- [ ] `fail2ban` active for `sshd`
- [ ] `exim4` disabled (if unused)
- [ ] `/home/deploy/.ssh/deploy_key` (private) removed from server
- [ ] `/root/DEPLOY-SECRETS.txt` removed
- [ ] GitHub Actions deploy verified after key cleanup

## Phase 3 — SSH tuning (non-disruptive)

- [ ] `/etc/ssh/sshd_config.d/99-itrain-hardening.conf` applied
- [ ] `sshd -t` passes; second SSH session tested before closing first

## Phase 4 — Admin user & root SSH

- [ ] `jameslcowan` exists, sudo, SSH key matches Fedora key
- [ ] Cursor/SSH works as `jameslcowan@137.184.37.56`
- [ ] `PermitRootLogin no` applied
- [ ] Root SSH login fails; `deploy` + `jameslcowan` succeed

## Phase 6 — Smoke test (all domains)

Run after DNS points to droplet (or with `curl --resolve`):

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
| | | |

## Optional (not in default rollout)

- [ ] SSH port change
- [ ] `AllowUsers` restriction
- [ ] `rrsync` / `ForceCommand` for `deploy`
- [ ] DO weekly snapshots
