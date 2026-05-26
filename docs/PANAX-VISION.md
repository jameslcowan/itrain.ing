# Panax platform vision

**panax.ai** owns the portfolio. Product sites (`.ing` apps) collect data; **Panax** is the AI layer that uses that warehouse plus future shared accounts.

## Brand layers

| Layer | Examples | Role |
|-------|----------|------|
| **Platform** | panax.ai, api.panax.ai | Owner, AI app, auth (future), ops |
| **Products** | powerlift.ing, itrain.ing, … | Focused builders users use daily |

**itrain.ing is a product**, not the platform. GitHub repo and clone: **`jameslcowan/panax`**, path **`~/panax`**.

## Data flow

```text
Product sites (site_id: powerlift, itrain, …)
        │  beacon → api.panax.ai
        ▼
   Postgres (platform_id: panax)
        │  read / aggregate
        ▼
   panax.ai AI app (future) + NocoDB (humans)
```

## Roadmap (summary)

1. **Now** — Products + ingest; panax.ai DNS; platform row `panax` in DB.
2. **Next** — Finish **itrain.ing** product (`sites/itraining/`) like other clones.
3. **Later** — Shared accounts on panax.ai; cross-site `user_id` on events.
4. **Mega AI** — Models and features reading the unified warehouse (policy + consent).

See [DATABASE.md](DATABASE.md), [DNS.md](DNS.md), [NOCODB.md](NOCODB.md).
