# Fix your local clone after history rewrite

`main` was rewritten (attribution cleanup + contribution email fix). Old commit SHAs on your laptop are invalid until you reset.

## Fedora (one command)

```bash
cd ~/panax
./scripts/fix-local-clone.sh
```

This script:

- Sets `origin` to `git@github.com:jameslcowan/panax.git` (SSH)
- `git fetch` + `git reset --hard origin/main`
- Sets `user.name` / `user.email` to your GitHub identity
- Enables repo hooks at `.githooks/` (strips `Co-authored-by: Cursor`)

## Manual steps

```bash
cd ~/panax
git fetch origin
git checkout main
git reset --hard origin/main

git config user.name "James L. Cowan Jr."
git config user.email "jameslloydcowan@gmail.com"
git config core.hooksPath .githooks
chmod +x .githooks/*
```

Verify:

```bash
git log -3 --format='%an <%ae>%n%s%n'
# Must NOT show: root@itrain.ing, Co-authored-by: Cursor
```

## Backup local work first

```bash
git branch backup-my-local-work
git fetch origin
git reset --hard origin/main
```

## Droplet

`/root/panax` tracks `origin/main`. Run `./scripts/fix-local-clone.sh` after each pull if unsure.

## Contributions still missing?

See [CONTRIBUTIONS-RESTORE.md](CONTRIBUTIONS-RESTORE.md).
