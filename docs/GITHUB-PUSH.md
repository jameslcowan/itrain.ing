# Git push (SSH)

This project uses **SSH remotes** for `git push` / `git pull`, not HTTPS.

## Developer machine (Fedora / laptop)

1. **SSH key** (once):

```bash
test -f ~/.ssh/id_ed25519 || ssh-keygen -t ed25519 -C "jameslloydcowan@gmail.com" -f ~/.ssh/id_ed25519
wl-copy < ~/.ssh/id_ed25519.pub   # add at https://github.com/settings/keys
```

2. **SSH config** (`~/.ssh/config`):

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
```

3. **Clone remote** (once per repo):

```bash
cd ~/itrain.ing   # or your clone path
./scripts/git-use-ssh-remote.sh
```

4. **Push**:

```bash
git push origin main
```

After a history rewrite, run `./scripts/fix-local-clone.sh` (resets to `origin/main` and configures hooks).

## Droplet (`root@itrain`)

Push uses a **dedicated deploy key** at `/root/.ssh/github_push` (not the CI rsync key).

### One-time setup

1. Repo → **Settings → Deploy keys → Add deploy key**
2. Title: `itrain-droplet-push`
3. Key:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAII9Nx3x8QVdYHEFcB4vamebEvK2qMcxE01cqWKM5Lql9 itrain-droplet-git-push
```

4. Enable **Allow write access**
5. On the droplet:

```bash
cd /root/itrain.ing && ./infra/server/git-push.sh
```

Show public key on server:

```bash
cat /root/.ssh/github_push.pub
```

## Keys (do not mix)

| Purpose | Private key | Public key on |
|---------|-------------|---------------|
| **Your laptop → GitHub** | `~/.ssh/id_ed25519` | GitHub account → SSH keys |
| **GitHub Actions → droplet rsync** | Secret `SSH_PRIVATE_KEY` only | `/home/deploy/.ssh/authorized_keys` |
| **Droplet → GitHub push** | `/root/.ssh/github_push` | Repo deploy key (write) |

The CI deploy private key must **not** remain on the server after hardening.
