import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { renderShell } from "../blog/templates.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const mainHtml = `<main id="main" class="notfound-main">
  <div class="notfound">
    <p class="notfound__code" aria-hidden="true">404</p>
    <h1 class="notfound__title">Page not found</h1>
    <p class="notfound__lead">That URL isn’t on powerlift.ing. Pick a destination below or head home.</p>
    <ul class="notfound__links">
      <li><a class="lp-btn--primary" href="/app">Launch app</a></li>
      <li><a href="/programs/">Programs</a></li>
      <li><a href="/">Home</a></li>
      <li><a href="/faq/">FAQ</a></li>
    </ul>
  </div>
</main>`;

const html = renderShell({
  title: "Page not found",
  description: "This page does not exist on powerlift.ing.",
  omitCanonical: true,
  noindex: true,
  bodyClass: "landingPage blogPage notfoundPage",
  mainHtml,
  extraStylesheets: ["/site-404.css"],
});

writeFileSync(join(ROOT, "404.html"), html);
console.log("✅ 404.html");
