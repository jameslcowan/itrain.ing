import { BLOG_META, SITE_URL } from "../content/blog-meta.js";

export function buildArticleSchema(article) {
  const tags = Array.isArray(article.tags) ? article.tags : [];
  const wordCount = (article.content || "").split(/\s+/).filter(Boolean).length;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    image: article.image,
    url: `${SITE_URL}/blog/${article.slug}/`,
    datePublished: article.published || article.created,
    dateModified: article.updated || article.published || article.created,
    author: {
      "@type": "Person",
      name: BLOG_META.author,
      url: "https://x.com/jameslcowan",
    },
    publisher: {
      "@type": "Organization",
      name: BLOG_META.siteName,
      url: SITE_URL,
    },
    wordCount,
    articleSection: tags[0] || "Powerlifting",
    mainEntityOfPage: `${SITE_URL}/blog/${article.slug}/`,
  };
}

export function buildBreadcrumbSchema(article) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog/` },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}/blog/${article.slug}/`,
      },
    ],
  };
}

export function buildFaqSchema(article) {
  const raw = article.faq;
  if (!raw) return null;
  const items = (Array.isArray(raw) ? raw : [raw])
    .map((entry) => {
      const [q, a] = String(entry).split("|").map((s) => s.trim());
      if (!q || !a) return null;
      return {
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      };
    })
    .filter(Boolean);
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items,
  };
}
