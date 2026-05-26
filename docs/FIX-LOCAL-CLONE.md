# Fix your local clone after history rewrite

Git history on `main` was rewritten (attribution cleanup). Your laptop clone still has old commit SHAs until you reset.

## On your machine (Fedora)

```bash
cd ~/path/to/itrain.ing   # your local clone

git fetch origin
git checkout main
git reset --hard origin/main

# Confirm clean attribution
git log -3 --format='%an <%ae>%n%s%n'
# Should show: James L. Cowan Jr. <112015792+jameslcowan@users.noreply.github.com>
# Must NOT show: root@itrain.ing, Co-authored-by: Cursor

git config user.name "James L. Cowan Jr."
git config user.email "112015792+jameslcowan@users.noreply.github.com"
```

If you have unpushed local commits on top of old history, back them up first:

```bash
git branch backup-my-local-work
git fetch origin
git reset --hard origin/main
```

## On the droplet

Already reset to `origin/main` after push. Global git identity is set to your GitHub noreply email.
