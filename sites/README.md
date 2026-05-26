# Sites

| Folder | Domain | Status |
|--------|--------|--------|
| `powerlifting/` | powerlift.ing | Production — reference brand |
| `powerbuilding/` | powerbuild.ing | Branded clone (hypertrophy / strength) |
| `olympiclifting/` | olympiclift.ing | Branded clone (Olympic lifting) |
| `bootybuilding/` | bootybuild.ing | Branded clone (glute-focused) |
| `itraining/` | itrain.ing | General training product (same pattern as other sites) |

Each folder is a full static stack: `npm ci && npm run build`, then preview from the repo root:

```bash
npm run dev:powerbuilding   # http://127.0.0.1:8081/
npm run dev:itraining       # http://127.0.0.1:8084/
npm run dev:all             # ports 8080–8084
```

Branding is applied via [`scripts/apply-site-brand.mjs`](../scripts/apply-site-brand.mjs) — see [docs/BRANDING.md](../docs/BRANDING.md).
