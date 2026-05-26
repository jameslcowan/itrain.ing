# Git push from the droplet

Push uses a **dedicated deploy key** at `/root/.ssh/github_push` (not the CI rsync key).

## One-time setup

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

## CI vs push keys

| Purpose | Private key location | Public key |
|---------|---------------------|------------|
| GitHub Actions rsync | GitHub secret `SSH_PRIVATE_KEY` only | `/home/deploy/.ssh/authorized_keys` |
| Droplet `git push` | `/root/.ssh/github_push` (root only) | GitHub deploy key (write) |

After hardening, the CI private key must **not** remain on the server.
