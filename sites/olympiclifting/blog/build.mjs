import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js/lib/core";
import hljsJavascript from "highlight.js/lib/languages/javascript";
import hljsJson from "highlight.js/lib/languages/json";
import hljsMarkdown from "highlight.js/lib/languages/markdown";
import { BLOG_META, SITE_URL } from "../content/blog-meta.js";
import { SITE_BRAND } from "../content/site-brand.js";
import {
  parseFrontmatter,
  parseFrontmatterDateToUtcTimestamp,
  formatDisplayDate,
} from "./parse-frontmatter.mjs";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "./schema.mjs";
import { renderShell, renderArticleListItem, escapeHtml } from "./templates.mjs";

hljs.registerLanguage("javascript", hljsJavascript);
hljs.registerLanguage("js", hljsJavascript);
hljs.registerLanguage("json", hljsJson);
hljs.registerLanguage("markdown", hljsMarkdown);

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  })
);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "content", "articles");

function articleSortKey(a) {
  return a.created || a.published || a.updated || "";
}

function loadArticles() {
  if (!existsSync(CONTENT_DIR)) return [];
  const articles = [];
  for (const file of readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"))) {
    const raw = readFileSync(join(CONTENT_DIR, file), "utf-8");
    const { frontmatter, content } = parseFrontmatter(raw);
    const slug = frontmatter.slug || file.replace(/\.md$/, "");
    for (const field of ["title", "description", "published", "created", "updated"]) {
      if (!frontmatter[field]) throw new Error(`${file}: missing ${field}`);
    }
    const tags = frontmatter.tags
      ? Array.isArray(frontmatter.tags)
        ? frontmatter.tags
        : [frontmatter.tags]
      : [];
    articles.push({
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      image: frontmatter.image || BLOG_META.defaultImage,
      alt: frontmatter.alt || BLOG_META.defaultImageAlt,
      published: frontmatter.published,
      created: frontmatter.created,
      updated: frontmatter.updated,
      tags,
      faq: frontmatter.faq,
      content,
    });
  }
  return articles.sort(
    (a, b) =>
      parseFrontmatterDateToUtcTimestamp(articleSortKey(b)) -
      parseFrontmatterDateToUtcTimestamp(articleSortKey(a))
  );
}

function renderArticleBody(article) {
  let html = marked.parse(article.content);
  html = html.replace(/^<h1[^>]*>.*?<\/h1>\s*/i, "");
  html = html.replace(/<img\s+(?![^>]*loading=)/gi, "<img loading=\"lazy\" ");

  const words = (article.content || "").split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.ceil(words / 225));
  const created = formatDisplayDate(article.created);
  const updated = formatDisplayDate(article.updated);
  const dateParts = [];
  if (created) dateParts.push(`Published <time datetime="${article.published}">${created}</time>`);
  if (updated && updated !== created) {
    dateParts.push(`Updated <time datetime="${article.updated}">${updated}</time>`);
  }
  dateParts.push(`${readMin} min read`);

  const tagHtml = article.tags.length
    ? `<div class="blog-article__tags">${article.tags
        .map((t) => `<span class="blog-article__tag">${escapeHtml(t)}</span>`)
        .join("")}</div>`
    : "";

  return `<main id="main" class="blog-main">
  <article class="blog-article">
    <p class="blog-article__eyebrow"><a href="/blog/">Blog</a></p>
    <h1 class="blog-article__title">${escapeHtml(article.title)}</h1>
    <p class="blog-article__meta">${dateParts.join(" · ")}</p>
    ${tagHtml}
    <img class="blog-article__hero" src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt)}" width="1200" height="630" loading="eager" decoding="async" />
    <div class="blog-prose">
${html}
    </div>
    <aside class="blog-cta">
      <p class="blog-cta__title">Build your own program</p>
      <p class="blog-cta__text">${SITE_BRAND.blogCtaText}</p>
      <a class="lp-btn lp-btn--primary" href="/app">Launch App</a>
    </aside>
  </article>
</main>`;
}

function writeSitemap(articles) {
  const today = new Date().toISOString().split("T")[0];
  const urls = [
    `  <url><loc>${SITE_URL}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    `  <url><loc>${SITE_URL}/blog/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
    `  <url><loc>${SITE_URL}/programs/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
    `  <url><loc>${SITE_URL}/faq/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.85</priority></url>`,
    `  <url><loc>${SITE_URL}/terms/</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
    `  <url><loc>${SITE_URL}/privacy/</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
    ...articles.map((a) => {
      const lastmod = a.updated || a.published || today;
      return `  <url><loc>${SITE_URL}/blog/${a.slug}/</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
    }),
    `  <url><loc>${SITE_URL}/llms.txt</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>`,
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
  writeFileSync(join(ROOT, "sitemap.xml"), xml);
}

function writeFeed(articles) {
  const today = new Date().toISOString().split("T")[0];
  const latest = articles[0];
  const feedUpdated = (latest?.updated || latest?.published || today).toString().split("T")[0];
  const entries = articles
    .map((a) => {
      const updated = a.updated || a.published || a.created;
      const title = escapeHtml(a.title);
      const summary = escapeHtml(a.description);
      return `  <entry>
    <title>${title}</title>
    <link href="${SITE_URL}/blog/${a.slug}/" rel="alternate"/>
    <id>${SITE_URL}/blog/${a.slug}/</id>
    <updated>${updated}T00:00:00Z</updated>
    <summary>${summary}</summary>
  </entry>`;
    })
    .join("\n");
  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeHtml(BLOG_META.feedTitle)}</title>
  <subtitle>${escapeHtml(BLOG_META.feedSubtitle)}</subtitle>
  <link href="${SITE_URL}/feed.xml" rel="self"/>
  <link href="${SITE_URL}/" rel="alternate"/>
  <id>${SITE_URL}/blog/</id>
  <updated>${feedUpdated}T00:00:00Z</updated>
  <author><name>${escapeHtml(BLOG_META.author)}</name></author>
${entries}
</feed>
`;
  writeFileSync(join(ROOT, "feed.xml"), atom);
}

function build() {
  const articles = loadArticles();
  const blogDir = join(ROOT, "blog");
  mkdirSync(blogDir, { recursive: true });

  const listItems = articles
    .map((a) => renderArticleListItem(a, formatDisplayDate(a.published || a.created)))
    .join("\n");

  const indexMain = `<main id="main" class="blog-main">
  <header class="blog-index__head">
    <h1 class="blog-index__title">Blog</h1>
    <p class="blog-index__lead">${SITE_BRAND.blogIndexLead}</p>
  </header>
  <ul class="blog-list">
${listItems}
  </ul>
</main>`;

  writeFileSync(
    join(blogDir, "index.html"),
    renderShell({
      title: "Blog",
      description: BLOG_META.feedSubtitle,
      canonicalPath: "/blog/",
      mainHtml: indexMain,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${BLOG_META.siteName} Blog`,
          url: `${SITE_URL}/blog/`,
          description: BLOG_META.feedSubtitle,
        },
      ],
    })
  );
  console.log("✅ /blog/index.html");

  for (const article of articles) {
    const dir = join(blogDir, article.slug);
    mkdirSync(dir, { recursive: true });
    const jsonLd = [
      buildArticleSchema(article),
      buildBreadcrumbSchema(article),
    ];
    const faq = buildFaqSchema(article);
    if (faq) jsonLd.push(faq);

    writeFileSync(
      join(dir, "index.html"),
      renderShell({
        title: article.title,
        description: article.description,
        canonicalPath: `/blog/${article.slug}/`,
        ogType: "article",
        ogImage: article.image,
        mainHtml: renderArticleBody(article),
        jsonLd,
      })
    );
    console.log(`✅ /blog/${article.slug}/index.html`);
  }

  writeSitemap(articles);
  console.log("✅ sitemap.xml");
  writeFeed(articles);
  console.log("✅ feed.xml");
  console.log(`\nBuilt ${articles.length} article(s).`);
}

build();
