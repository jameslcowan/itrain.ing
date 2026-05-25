import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { BLOG_META } from "../content/blog-meta.js";
import { renderShell } from "../blog/templates.mjs";
import {
  buildFaqPageSchema,
  renderFaqBody,
  renderFaqJsonLdScript,
  renderLandingFaqContent,
} from "./render.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const INDEX_MARKERS = {
  jsonLd: ["<!-- FAQ_JSONLD_START -->", "<!-- FAQ_JSONLD_END -->"],
  content: ["<!-- FAQ_CONTENT_START -->", "<!-- FAQ_CONTENT_END -->"],
};

function replaceBetweenMarkers(html, [start, end], replacement) {
  const startIdx = html.indexOf(start);
  const endIdx = html.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `Missing markers ${start} / ${end} in index.html — add them around the FAQ section`
    );
  }
  const before = html.slice(0, startIdx + start.length);
  const after = html.slice(endIdx);
  return `${before}\n${replacement}\n${after}`;
}

function patchLandingIndex() {
  const indexPath = join(ROOT, "index.html");
  let html = readFileSync(indexPath, "utf8");

  html = replaceBetweenMarkers(html, INDEX_MARKERS.jsonLd, renderFaqJsonLdScript());
  html = replaceBetweenMarkers(html, INDEX_MARKERS.content, renderLandingFaqContent());

  writeFileSync(indexPath, html);
  console.log("✅ index.html (landing FAQ)");
}

function buildFaqPage() {
  const faqDir = join(ROOT, "faq");
  mkdirSync(faqDir, { recursive: true });

  const html = renderShell({
    title: "FAQ",
    description:
      "Frequently asked questions about powerlift.ing: free program builder, open sharing, %1RM maxes, coaches, and technical support.",
    canonicalPath: "/faq/",
    mainHtml: renderFaqBody(),
    jsonLd: [buildFaqPageSchema()],
    extraStylesheets: ["/faq.css"],
  });

  writeFileSync(join(faqDir, "index.html"), html);
  console.log("✅ /faq/index.html");
}

function build() {
  buildFaqPage();
  patchLandingIndex();
}

build();
