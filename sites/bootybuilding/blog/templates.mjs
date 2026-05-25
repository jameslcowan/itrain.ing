import { BLOG_META, SITE_URL } from "../content/blog-meta.js";
import { SITE_BRAND, brandWordmark } from "../content/site-brand.js";
import { renderSiteFooter } from "../site/footer.mjs";

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonLdScript(obj) {
  return `    <script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n    </script>`;
}

function siteMenu(navActive) {
  const blogCurrent = navActive === "blog" ? ' aria-current="page"' : "";
  const faqCurrent = navActive === "faq" ? ' aria-current="page"' : "";
  const programsCurrent = navActive === "programs" ? ' aria-current="page"' : "";
  return `
    <div id="landingMenu" class="site-menu" hidden>
      <button id="landingMenuClose" class="site-menu__close" type="button" aria-label="Close menu">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="site-menu__inner" role="dialog" aria-modal="true" aria-label="Navigation">
        <a class="site-menu__brand" href="/">${brandWordmark("site-menu__dot")}</a>
        <nav class="site-menu__nav" aria-label="Mobile">
          <a class="site-menu__link" href="/#how-it-works">How it works</a>
          <a class="site-menu__link" href="/programs/"${programsCurrent}>Programs</a>
          <a class="site-menu__link" href="/blog/"${blogCurrent}>Blog</a>
          <a class="site-menu__link" href="/faq/"${faqCurrent}>FAQ</a>
        </nav>
        <div class="site-menu__foot">
          <a class="site-menu__btn site-menu__btn--primary" href="/app">Launch App</a>
          <button id="landingThemeToggleBtn" class="site-menu__btn site-menu__btn--ghost" type="button">
            <svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use id="landingThemeIcon" href="#i-dark-mode"></use></svg>
            <span>Theme</span>
          </button>
        </div>
        <p class="site-menu__credit">Made by <a href="https://x.com/jameslcowan" target="_blank" rel="noopener noreferrer">@jameslcowan</a></p>
      </div>
    </div>`;
}

export function renderShell({
  title,
  description,
  canonicalPath = "/",
  ogType = "website",
  ogImage,
  mainHtml,
  jsonLd = [],
  extraStylesheets = [],
  extraScripts = [],
  bodyClass: bodyClassOverride,
  noindex = false,
  omitCanonical = false,
}) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  const ogUrl = omitCanonical ? SITE_URL : canonical;
  const pageTitle = title.includes(SITE_BRAND.domain) ? title : `${title} · ${BLOG_META.titleSuffix}`;
  const image = ogImage || BLOG_META.defaultImage;
  const ld = jsonLd.map(jsonLdScript).join("\n");

  const blogNavCurrent = canonicalPath.startsWith("/blog") ? ' aria-current="page"' : "";
  const faqNavCurrent = canonicalPath === "/faq/" ? ' aria-current="page"' : "";
  const programsNavCurrent = canonicalPath === "/programs/" ? ' aria-current="page"' : "";
  const navActive =
    canonicalPath === "/faq/"
      ? "faq"
      : canonicalPath === "/programs/"
        ? "programs"
        : canonicalPath.startsWith("/blog")
          ? "blog"
          : "";
  const extraCss = extraStylesheets
    .map((href) => `    <link rel="stylesheet" href="${escapeHtml(href)}" />`)
    .join("\n");
  const bodyClass =
    bodyClassOverride ??
    (canonicalPath === "/faq/"
      ? "landingPage blogPage faqPage"
      : canonicalPath === "/programs/"
        ? "landingPage blogPage programsPage"
        : "landingPage blogPage");
  const extraJs = extraScripts
    .map((src) => `    <script src="${escapeHtml(src)}" defer></script>`)
    .join("\n");

  return `<!doctype html>
<html lang="en" class="lp-boot">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="author" content="${escapeHtml(BLOG_META.author)}" />
${noindex ? '    <meta name="robots" content="noindex, follow" />\n' : ""}${omitCanonical ? "" : `    <link rel="canonical" href="${escapeHtml(canonical)}" />\n`}
    <link rel="alternate" type="application/atom+xml" title="${escapeHtml(BLOG_META.feedTitle)}" href="/feed.xml" />
    <meta property="og:site_name" content="${escapeHtml(BLOG_META.siteName)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${escapeHtml(ogUrl)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:creator" content="${escapeHtml(BLOG_META.twitter)}" />
    <meta name="theme-color" content="${SITE_BRAND.themeColorDark}" media="(prefers-color-scheme: dark)" />
    <meta name="theme-color" content="${SITE_BRAND.themeColorLight}" media="(prefers-color-scheme: light)" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${SITE_BRAND.googleFontsUrl}" />
    <script src="/theme.js"></script>
    <link rel="stylesheet" href="/fonts.css" />
    <link rel="stylesheet" href="/design-tokens.css" />
    <link rel="stylesheet" href="/site-header.css" />
    <link rel="stylesheet" href="/site-menu.css" />
    <link rel="stylesheet" href="/landing.css" />
    <link rel="stylesheet" href="/brand-typography.css" />
    <link rel="stylesheet" href="/site-footer.css" />
    <link rel="stylesheet" href="/blog.css" />
    <link rel="stylesheet" href="/blog/hljs.css" />
${extraCss ? `${extraCss}\n` : ""}
    <script src="/fonts-boot.js"></script>
    <script src="/landing-boot.js"></script>
${ld}
  </head>
  <body class="${bodyClass}">
    <a class="srOnly" href="#main">Skip to content</a>
    <svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
      <symbol id="i-dark-mode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
      </symbol>
      <symbol id="i-light-mode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </symbol>
    </svg>
    <header class="site-header">
      <div class="site-header__row">
        <a class="site-header__brand" href="/">${brandWordmark()}</a>
        <nav class="site-header__nav" aria-label="Primary">
          <a href="/#how-it-works">How it works</a>
          <a href="/programs/"${programsNavCurrent}>Programs</a>
          <a href="/blog/"${blogNavCurrent}>Blog</a>
          <a href="/faq/"${faqNavCurrent}>FAQ</a>
        </nav>
        <div class="site-header__actions">
          <a class="site-header__btn site-header__btn--primary site-header__cta--launch" href="/app">Launch App</a>
          <button id="landingMenuBtn" class="site-menu__trigger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="landingMenu" aria-haspopup="dialog">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 5h16M4 12h16M4 19h16"/></svg>
          </button>
        </div>
      </div>
    </header>
${siteMenu(navActive)}
    ${mainHtml}
    ${renderSiteFooter()}
    <script src="/landing.js" defer></script>
${extraJs ? `${extraJs}\n` : ""}
  </body>
</html>`;
}

export function renderArticleListItem(article, displayDate) {
  return `
    <li class="blog-card">
      <a class="blog-card__link" href="/blog/${escapeHtml(article.slug)}/">
        <h2 class="blog-card__title">${escapeHtml(article.title)}</h2>
        <p class="blog-card__desc">${escapeHtml(article.description)}</p>
        <p class="blog-card__meta"><time datetime="${escapeHtml(article.published || article.created)}">${escapeHtml(displayDate)}</time></p>
      </a>
    </li>`;
}
