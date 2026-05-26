# Analytics beacon (client)

Posts to PostgREST RPCs on `api.itrain.ing`. **Do not enable on production HTML until privacy policies are updated.**

## Usage

```html
<script src="/packages/analytics/analytics.js" defer
  data-site-id="powerlift"
  data-api-base="https://api.itrain.ing"></script>
```

## Custom events

```js
window.itrainAnalytics.track('program_card_open', {
  p_template_id: 'beginner-lp',
});
```

## Site IDs

| Site folder | `data-site-id` |
|-------------|----------------|
| `sites/powerlifting/` | `powerlift` |
| `sites/powerbuilding/` | `powerbuild` |
| `sites/olympiclifting/` | `olympiclift` |
| `sites/bootybuilding/` | `bootybuild` |
| `sites/itraining/` | `itrain` |

See [docs/ANALYTICS-IMPLEMENTATION.md](../../docs/ANALYTICS-IMPLEMENTATION.md) Track D.
