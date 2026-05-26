# Restore GitHub contribution graph (itrain.ing)

After the attribution cleanup (`git filter-repo` + force-push), GitHub must **re-link** commits to your profile. Commits are correct on `main` (no `Co-authored-by: Cursor`, no `root@itrain.ing`), but the **public heatmap can stay empty** until emails are verified and the graph is rebuilt.

## 1. Verify emails (do this first — often instant)

GitHub → **Settings → Emails**. Confirm **verified**:

- `jameslloydcowan@gmail.com` (primary — used on your other repos)
- `112015792+jameslcowan@users.noreply.github.com` (Settings → “Keep my email private” noreply)

If either is missing, **add and verify**. The graph rebuilds when a new address is linked.

Profile → **Contributions** → enable **Include private contributions** if any repo was ever private.

## 2. Fix your Fedora clone (required before you push again)

```bash
cd ~/Documents/GitHub/itrain.ing
./scripts/fix-local-clone.sh
```

Or manually: `git fetch origin && git reset --hard origin/main` plus `git config core.hooksPath .githooks`.

**Never push from a stale clone** — you could reintroduce old SHAs or agent trailers.

## 3. Confirm a commit counts

Pick any commit on `main`, open:

`https://github.com/jameslcowan/itrain.ing/commit/<sha>.patch`

`From:` must be your name + a verified email (not `root@itrain.ing`, no `Co-authored-by: Cursor`).

## 4. History email on `main`

`main` uses **`jameslloydcowan@gmail.com`** for all commits (same as `actual-theme-terminal`, `openclaw`). That email is already linked to your account on other repos.

## 5. If the heatmap is still empty after email verify

Contact [GitHub Support](https://support.github.com/) → **Account and profile** → **Contribution graph**:

- Repo: `jameslcowan/itrain.ing`
- Issue: contribution graph empty after history rewrite to fix unauthorized `Co-authored-by: Cursor` and `root@itrain.ing`
- Date of force-push: 2026-05-26
- Request: **rebuild contribution graph** for rewritten SHAs on `main`

Repo participation stats can show activity while the profile heatmap lags or needs a manual rebuild after force-push.

## 6. Never again

See `docs/GIT-ATTRIBUTION-POLICY.md` and `.cursor/rules/no-agent-git-attribution.mdc`.
