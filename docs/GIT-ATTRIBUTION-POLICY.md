# Git attribution policy

**All commits must be human-authored only.** No Cursor/agent co-authors, no device identities (`root@itrain.ing`).

## Droplet safeguards (enforced on server)

| Layer | Location |
|-------|----------|
| Global git hooks | `/root/.config/git/hooks/` — strips `Co-authored-by: Cursor` on every commit |
| `jameslcowan` user | `/home/jameslcowan/.config/git/hooks/` (same hooks) |
| CLI config | `~/.cursor/cli-config.json` — `attributeCommitsToAgent: false` |
| Project CLI | `.cursor/cli.json` — attribution disabled |
| Agent rule | `.cursor/rules/no-agent-git-attribution.mdc` |

Hooks are enabled with:

```bash
git config --global core.hooksPath ~/.config/git/hooks
```

## If co-author lines reappear

1. Do **not** use normal `git commit` from Cursor Agent on the server until hooks are verified.
2. Commit on your **Fedora machine** (your hooks, your identity).
3. Or on-server: `git commit-tree` with an explicit message (bypasses injection).

## History cleanup

May 2026: full `main` history was rewritten to remove `Co-authored-by: Cursor` and `root@itrain.ing` authors. See `docs/FIX-LOCAL-CLONE.md` to reset local clones.
