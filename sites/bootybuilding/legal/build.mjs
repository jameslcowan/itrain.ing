import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { renderShell } from "../blog/templates.mjs";
import { SITE_BRAND } from "../content/site-brand.js";
import { renderSiteFooter } from "../site/footer.mjs";
import { LEGAL_UPDATED, TERMS_BODY, PRIVACY_BODY } from "./content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const FOOTER_MARKER = ["<!-- SITE_FOOTER_START -->", "<!-- SITE_FOOTER_END -->"];

function renderLegalMain({ title, bodyHtml }) {
  return `<main id="main" class="legal-main">
  <article class="legal-doc">
    <header>
      <h1 class="legal-doc__title">${title}</h1>
      <p class="legal-doc__updated">Last updated: ${LEGAL_UPDATED}</p>
    </header>
    ${bodyHtml}
  </article>
</main>`;
}

function writeLegalPage(dirName, { pageTitle, metaDescription, canonicalPath, bodyHtml }) {
  const dir = join(ROOT, dirName);
  mkdirSync(dir, { recursive: true });
  const html = renderShell({
    title: pageTitle,
    description: metaDescription,
    canonicalPath,
    mainHtml: renderLegalMain({ title: pageTitle, bodyHtml }),
    extraStylesheets: ["/legal.css"],
  });
  writeFileSync(join(dir, "index.html"), html);
  console.log(`✅ /${dirName}/index.html`);
}

function replaceBetweenMarkers(html, [start, end], replacement) {
  const startIdx = html.indexOf(start);
  const endIdx = html.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Missing markers ${start} / ${end}`);
  }
  return `${html.slice(0, startIdx + start.length)}\n${replacement}\n${html.slice(endIdx)}`;
}

function patchLandingFooter() {
  const footer = renderSiteFooter();
  const indexPath = join(ROOT, "index.html");
  let indexHtml = readFileSync(indexPath, "utf8");
  indexHtml = replaceBetweenMarkers(indexHtml, FOOTER_MARKER, footer);
  writeFileSync(indexPath, indexHtml);
  console.log("✅ index.html (footer)");
}

function build() {
  writeLegalPage("terms", {
    pageTitle: "Terms of Service",
    metaDescription: `Terms of Service for ${SITE_BRAND.domain}: free program builder, open share links, disclaimers, and limitation of liability.`,
    canonicalPath: "/terms/",
    bodyHtml: TERMS_BODY,
  });
  writeLegalPage("privacy", {
    pageTitle: "Privacy Policy",
    metaDescription: `Privacy Policy for ${SITE_BRAND.domain}: minimal data collection, programs in share links, and browser storage.`,
    canonicalPath: "/privacy/",
    bodyHtml: PRIVACY_BODY,
  });
  patchLandingFooter();
}

build();
