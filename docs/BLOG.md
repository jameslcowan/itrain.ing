# Blog (SSG)

Markdown articles are built to static HTML under `/blog/`.

## Commands

```bash
npm install
npm run build:blog
```

Netlify runs `npm run build` before publish.

## Add an article

1. Create `content/articles/<slug>.md` with required frontmatter (see below).
2. Run `npm run build:blog`.
3. Commit the Markdown and generated `blog/` HTML (or rely on CI build).

## Required frontmatter

```yaml
---
slug: my-post
title: Post title
description: One sentence for SEO (under 160 characters).
image: https://...   # optional; defaults to blog-meta default
alt: Hero description
published: 2026-05-22
created: 2026-05-22
updated: 2026-05-22
tags:
  - programming
---
```

Do not add an `<h1>` in the body; the template renders the title.

Optional `faq` for FAQPage JSON-LD:

```yaml
faq:
  - "Question? | Answer."
```

## Output

| Path | Purpose |
|------|---------|
| `/blog/` | Article index |
| `/blog/{slug}/` | Article |
| `/sitemap.xml` | Regenerated (includes blog URLs) |
| `/feed.xml` | Atom feed |

Shared `/app/*` routes stay noindex per [SEO.md](SEO.md).

See also [SITE.md](SITE.md) for the full build pipeline and [TODO.md](TODO.md) for content ideas.
