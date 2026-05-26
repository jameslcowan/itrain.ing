# Rename repo and droplet to Panax

The platform brand is **Panax** (`panax.ai`). The GitHub repo and clone folder may still be `itrain.ing` until you complete these steps.

## 1. GitHub repository

In GitHub: **Settings → General → Repository name** → `panax` (or `panax-platform`).

Then on every clone:

```bash
git remote set-url origin git@github.com:jameslcowan/panax.git
git fetch origin
```

Update `scripts/git-use-ssh-remote.sh` if the remote URL changed.

## 2. Local / droplet clone directory (optional)

```bash
mv ~/itrain.ing ~/panax
cd ~/panax
```

Re-open the folder in Cursor at `~/panax`.

On the droplet the clone may stay at `/home/jameslcowan/itrain.ing`; a symlink works:

```bash
ln -sfn /home/jameslcowan/itrain.ing /home/jameslcowan/panax
```

## 3. Droplet hostname

```bash
sudo hostnamectl set-hostname panax
```

DigitalOcean control panel: rename droplet to **panax** (display only; IP unchanged).

## 4. What we do not rename (internal codenames)

| Name | Reason |
|------|--------|
| Postgres database `itrain` | Cost/risk of dump/restore; harmless internal name |
| `/etc/itrain/postgrest.env` | Paths on server; migrate later if desired |

Product domain **itrain.ing** and `site_id` **`itrain`** stay — that is the general-training **app**, not the platform.
