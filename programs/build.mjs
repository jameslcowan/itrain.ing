import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PROGRAMS } from "../content/programs-data.js";
import { renderShell, escapeHtml } from "../blog/templates.mjs";
import { encodeProgram } from "./encode-state.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function appHref(program) {
  if (!program) return "/app";
  return `/app/${encodeURIComponent(encodeProgram(program))}`;
}

function renderProgramCard(card) {
  const href = appHref(card.program);
  const id = escapeHtml(card.id);
  const title = escapeHtml(card.title);
  const subtitle = card.subtitle ? `<p class="prog-card__subtitle">${escapeHtml(card.subtitle)}</p>` : "";
  const labelTop = card.label ? `<span class="lp-badge">${escapeHtml(card.label)}</span>` : "";
  const badgeTop = card.badge
    ? `<span class="lp-badge lp-badge--muted">${escapeHtml(card.badge)}</span>`
    : "";
  const category = card.category
    ? `<span class="lp-badge lp-badge--muted">${escapeHtml(card.category)}</span>`
    : "";
  const description = escapeHtml(card.description);

  return `<article class="prog-card-stack" data-program-id="${id}">
  <div class="prog-card prog-card--base">
    <div class="prog-card__meta">${labelTop}${badgeTop ? ` ${badgeTop}` : ""}</div>
    <div class="prog-card__header">
      <h2 class="prog-card__title">${title}</h2>
      ${subtitle}
    </div>
    <div class="prog-card__foot">${category}</div>
  </div>
  <div class="prog-card prog-card--overlay" aria-hidden="true">
    <div class="prog-card__header">
      <h2 class="prog-card__title">${title}</h2>
      <p class="prog-card__subtitle">Open in the powerlift.ing editor</p>
    </div>
    <a class="lp-btn lp-btn--primary prog-card__action" href="${escapeHtml(href)}">Open program</a>
  </div>
  <dialog class="prog-dialog" aria-labelledby="prog-dialog-title-${id}">
    <div class="prog-dialog__content">
      <h2 id="prog-dialog-title-${id}" class="prog-dialog__title">${title}</h2>
      <p class="prog-dialog__text">${description}</p>
      <div class="prog-dialog__actions">
        <a class="lp-btn lp-btn--primary" href="${escapeHtml(href)}">Open in builder</a>
        <button class="lp-btn lp-btn--ghost" type="button" data-dialog-close>Close</button>
      </div>
    </div>
  </dialog>
</article>`;
}

function renderProgramsBody(cards) {
  const grid = cards.map(renderProgramCard).join("\n");
  return `<main id="main" class="blog-main programs-main">
  <header class="programs-page__head">
    <h1 class="programs-page__title lp-display">Programs</h1>
    <p class="programs-page__lead">Free powerlifting templates from powerlift.ing. Pick a card, open it in the builder, edit anything, and share your version as one link.</p>
    <p class="programs-page__actions">
      <a class="lp-btn lp-btn--ghost" href="/app">Start blank</a>
    </p>
  </header>
  <section class="programs-grid" aria-label="Program templates">
    <div class="programs-grid__inner">
${grid}
    </div>
  </section>
</main>`;
}

function build() {
  const dir = join(ROOT, "programs");
  mkdirSync(dir, { recursive: true });

  const html = renderShell({
    title: "Programs",
    description:
      "Free powerlifting program templates on powerlift.ing: 3-day SBD, 5/3/1, bench focus, meet prep, and more. Open in the builder and share one link.",
    canonicalPath: "/programs/",
    mainHtml: renderProgramsBody(PROGRAMS),
    extraStylesheets: ["/programs.css"],
    extraScripts: ["/programs.js"],
  });

  writeFileSync(join(dir, "index.html"), html);
  console.log(`✅ /programs/index.html (${PROGRAMS.length} templates)`);
}

build();
