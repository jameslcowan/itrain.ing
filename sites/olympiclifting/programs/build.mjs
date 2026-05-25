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

function cardLabel(text) {
  if (!text) return "";
  return `<span class="prog-card__label">${escapeHtml(text)}</span>`;
}

function weekCountLabel(program) {
  const n = program?.weeks?.length;
  if (!n) return "";
  return n === 1 ? "1 week" : `${n} weeks`;
}

function cardCorner(content, corner) {
  return `<div class="prog-card__corner prog-card__corner--${corner}">${content}</div>`;
}

/** Top/bottom rows: dedicated TL / TR (or BL / BR) corners — no stacking */
function cardMetaRow(left, right, rowClass) {
  if (!left && !right) return "";
  const top = rowClass.includes("top");
  return `<div class="${rowClass}">
  ${cardCorner(left, top ? "tl" : "bl")}
  ${cardCorner(right, top ? "tr" : "br")}
</div>`;
}

function renderProgramCard(card) {
  const href = appHref(card.program);
  const id = escapeHtml(card.id);
  const title = escapeHtml(card.title);
  const subtitle = card.subtitle ? `<p class="prog-card__subtitle">${escapeHtml(card.subtitle)}</p>` : "";
  const description = escapeHtml(card.description);

  const topLeft = cardLabel(card.label);
  const topRight = cardLabel(weekCountLabel(card.program));
  const bottomLeft = cardLabel(card.category);
  const bottomRight = cardLabel(card.badge);

  return `<article class="prog-card-stack" data-program-id="${id}">
  <div class="prog-card prog-card--base">
    ${cardMetaRow(topLeft, topRight, "prog-card__content-top")}
    <div class="prog-card__header">
      <h2 class="prog-card__title">${title}</h2>
      ${subtitle}
    </div>
    ${cardMetaRow(bottomLeft, bottomRight, "prog-card__content-bottom")}
  </div>
  <div class="prog-card prog-card--overlay" aria-hidden="true">
    <div class="prog-card__header">
      <h2 class="prog-card__title">${title}</h2>
      <p class="prog-card__subtitle">Open in the powerlift.ing editor</p>
    </div>
    <button class="lp-btn lp-btn--primary prog-card__action" type="button" data-dialog-open>Open program</button>
  </div>
  <dialog class="prog-dialog" aria-labelledby="prog-dialog-title-${id}">
    <div class="prog-dialog__content">
      <h2 id="prog-dialog-title-${id}" class="prog-dialog__title">${title}</h2>
      <p class="prog-dialog__text">${description}</p>
      <div class="prog-dialog__actions">
        <a class="lp-btn lp-btn--primary prog-dialog__open" href="${escapeHtml(href)}">Open in builder</a>
        <button class="lp-btn lp-btn--ghost" type="button" data-dialog-close>Close</button>
      </div>
    </div>
  </dialog>
</article>`;
}

function renderProgramsBody(cards) {
  const grid = cards.map(renderProgramCard).join("\n");
  return `<main id="main" class="programs-main">
  <header class="programs-page__head">
    <h1 class="programs-page__title lp-display">Free powerlifting programs</h1>
    <p class="programs-page__lead">Free powerlifting templates from powerlift.ing. Pick a card, open it in the builder, edit anything, and share your version as one link. Use the <strong>Blank program</strong> card to start from scratch.</p>
  </header>
  <section class="programs-grid" aria-label="Program templates">
    <div class="programs-grid__container">
      <div class="programs-grid__inner">
${grid}
      </div>
    </div>
  </section>
</main>`;
}

function build() {
  const dir = join(ROOT, "programs");
  mkdirSync(dir, { recursive: true });

  const html = renderShell({
    title: "Free powerlifting programs",
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
