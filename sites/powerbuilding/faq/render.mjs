import { FAQ_SECTIONS } from "../content/faq-data.js";
import { SITE_BRAND } from "../content/site-brand.js";
import { escapeHtml } from "../blog/templates.mjs";

export function stripHtml(html) {
  return String(html)
    .replace(/<li[^>]*>/gi, " ")
    .replace(/<\/li>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\. \./g, ".")
    .trim();
}

export function buildFaqPageSchema() {
  const mainEntity = [];
  for (const section of FAQ_SECTIONS) {
    for (const item of section.items) {
      mainEntity.push({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: stripHtml(item.a),
        },
      });
    }
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

export function renderFaqJsonLdScript() {
  return `    <script type="application/ld+json">\n${JSON.stringify(buildFaqPageSchema(), null, 2)}\n    </script>`;
}

export function renderFaqNav() {
  const items = FAQ_SECTIONS.map(
    (s) => `      <li><a href="#${escapeHtml(s.id)}">${escapeHtml(s.title)}</a></li>`
  ).join("\n");
  return `    <ul class="faq-page__nav lp-reveal" aria-label="FAQ sections">\n${items}\n    </ul>`;
}

export function renderFaqSections() {
  return FAQ_SECTIONS.map((section) => {
    const items = section.items
      .map(
        (item) => `        <details>
          <summary>${escapeHtml(item.q)}</summary>
          ${item.a}
        </details>`
      )
      .join("\n");
    return `    <section class="faq-section lp-reveal" id="${escapeHtml(section.id)}">
      <h3 class="faq-section__title">${escapeHtml(section.title)}</h3>
      <div class="lp-faq">
${items}
      </div>
    </section>`;
  }).join("\n");
}

/** Full FAQ block for the marketing landing page (#faq). */
export function renderLandingFaqContent() {
  return `${renderFaqNav()}\n${renderFaqSections()}`;
}

/** FAQ page uses h2 section titles inside <main>. */
export function renderFaqPageSections() {
  return FAQ_SECTIONS.map((section) => {
    const items = section.items
      .map(
        (item) => `<details>
  <summary>${escapeHtml(item.q)}</summary>
  ${item.a}
</details>`
      )
      .join("\n");
    return `<section class="faq-section" id="${escapeHtml(section.id)}">
  <h2 class="faq-section__title">${escapeHtml(section.title)}</h2>
  <div class="lp-faq">
${items}
  </div>
</section>`;
  }).join("\n");
}

export function renderFaqPageNav() {
  const nav = FAQ_SECTIONS.map(
    (s) => `<li><a href="#${escapeHtml(s.id)}">${escapeHtml(s.title)}</a></li>`
  ).join("\n");
  return `<ul class="faq-page__nav" aria-label="FAQ sections">\n${nav}\n</ul>`;
}

export function renderFaqBody() {
  return `<main id="main" class="blog-main lp-faq-full">
  <header class="faq-page__head">
    <h1 class="faq-page__title">FAQ</h1>
    <p class="faq-page__lead">${SITE_BRAND.faqLandingLead} — in plain language.</p>
    ${renderFaqPageNav()}
  </header>
${renderFaqPageSections()}
  <aside class="faq-page__cta">
    <p>Need more help? Read <a href="/blog/how-sharing-works/">how sharing works</a> or browse the <a href="/blog/">blog</a>, then open <a href="/app">${SITE_BRAND.domain}</a>.</p>
    <a class="lp-btn lp-btn--primary" href="/app">Launch App</a>
  </aside>
</main>`;
}
