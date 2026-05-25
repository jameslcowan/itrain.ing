#!/usr/bin/env node
/**
 * Apply marketing brand to a site folder under sites/.
 * Usage: node scripts/apply-site-brand.mjs powerbuilding
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { SITE_BRANDS } from "./site-brands.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..");

const key = process.argv[2];
if (!key || !SITE_BRANDS[key]) {
  console.error("Usage: node scripts/apply-site-brand.mjs <powerbuilding|olympiclifting|bootybuilding>");
  process.exit(1);
}

const b = SITE_BRANDS[key];
const ROOT = join(REPO, "sites", key);

function write(rel, content) {
  const path = join(ROOT, rel);
  writeFileSync(path, content);
  console.log(`  wrote ${rel}`);
}

function patch(rel, pairs) {
  const path = join(ROOT, rel);
  let text = readFileSync(path, "utf8");
  for (const [from, to] of pairs) {
    text = typeof from === "string" ? text.split(from).join(to) : text.replace(from, to);
  }
  writeFileSync(path, text);
  console.log(`  patched ${rel}`);
}

function brandWordmark(dotClass = "site-header__dot") {
  return `${b.slug}<span class="${dotClass}">.</span>${b.tld}`;
}

function designTokensCss() {
  return `/* ${b.comment} */
/* Fonts: load fonts.css (or Google <link>) in HTML before this file. */

:root {
  /* Brand */
  --pl-plate: ${b.primary};
  --pl-plate-dim: ${b.primaryDim};
  --pl-chalk: ${b.chalk};
  --pl-iron: ${b.iron};
  --pl-steel: ${b.steel};
  --pl-rack: ${b.rack};
  --pl-rack-up: ${b.rackUp};

  /* Semantic */
  --bg: var(--pl-chalk);
  --bg-elevated: #ffffff;
  --panel: #ffffff;
  --panel2: #eeede8;
  --text: #121214;
  --text-strong: #0d0d0f;
  --muted: #5c5c66;
  --border: #d8d6d0;
  --border2: #c4c2bc;
  --accent: var(--pl-plate);
  --accent-muted: color-mix(in srgb, var(--pl-plate) 14%, transparent);
  --danger: #dc2626;
  --success: #16a34a;
  --focus-ring: color-mix(in srgb, var(--pl-plate) 40%, transparent);

  --shadow: 0 4px 24px rgba(13, 13, 15, 0.08);
  --shadow-lg: 0 12px 40px rgba(13, 13, 15, 0.12);
  --ghost-border: var(--border2);

  --sb-track: var(--pl-chalk);
  --sb-thumb: #b8b6b0;
  --sb-thumb-hover: #9a9892;

  --radius: 12px;
  --radius2: 8px;
  --radius-pill: 999px;

  --space-1: 6px;
  --space-2: 10px;
  --space-3: 14px;
  --space-4: 20px;
  --space-5: 28px;
  --space-6: 36px;

  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.0625rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --leading-tight: 1.35;
  --leading-body: 1.65;
  --leading-relaxed: 1.75;
  --prose-gap: var(--space-4);
  --prose-gap-lg: var(--space-5);

  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);

  --font-display: ${b.fontDisplay};
  --sans: ${b.fontSans};
  --mono: "JetBrains Mono", ui-monospace, monospace;

  --topbar-h: 52px;
  --weekbar-h: auto;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: var(--pl-iron);
    --bg-elevated: var(--pl-steel);
    --panel: var(--pl-steel);
    --panel2: var(--pl-rack);
    --text: #f4f4f5;
    --text-strong: #ffffff;
    --muted: #9ca3af;
    --border: #2e2e36;
    --border2: #3a3a44;
    --accent-muted: color-mix(in srgb, var(--pl-plate) 18%, transparent);
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.55);
    --ghost-border: var(--border2);
    --sb-track: var(--pl-iron);
    --sb-thumb: #3a3a44;
    --sb-thumb-hover: #4a4a56;
  }
}

html[data-theme="light"] {
  color-scheme: light;
  --bg: var(--pl-chalk);
  --bg-elevated: #ffffff;
  --panel: #ffffff;
  --panel2: #eeede8;
  --text: #121214;
  --text-strong: #0d0d0f;
  --muted: #5c5c66;
  --border: #d8d6d0;
  --border2: #c4c2bc;
  --accent-muted: color-mix(in srgb, var(--pl-plate) 14%, transparent);
  --shadow: 0 4px 24px rgba(13, 13, 15, 0.08);
  --shadow-lg: 0 12px 40px rgba(13, 13, 15, 0.12);
  --sb-track: var(--pl-chalk);
  --sb-thumb: #b8b6b0;
  --sb-thumb-hover: #9a9892;
}

html[data-theme="dark"] {
  color-scheme: dark;
  --bg: var(--pl-iron);
  --bg-elevated: var(--pl-steel);
  --panel: var(--pl-steel);
  --panel2: var(--pl-rack);
  --text: #f4f4f5;
  --text-strong: #ffffff;
  --muted: #9ca3af;
  --border: #2e2e36;
  --border2: #3a3a44;
  --accent-muted: color-mix(in srgb, var(--pl-plate) 18%, transparent);
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.55);
  --sb-track: var(--pl-iron);
  --sb-thumb: #3a3a44;
  --sb-thumb-hover: #4a4a56;
}

html[data-theme="light"],
html[data-theme="dark"] {
}

html {
  scrollbar-gutter: stable;
}
`;
}

function siteBrandJs() {
  return `/** Site brand — marketing shell (imported by templates, footer, builds). */

export const SITE_BRAND = {
  domain: "${b.domain}",
  slug: "${b.slug}",
  tld: "${b.tld}",
  siteUrl: "https://${b.domain}",
  productLine: "${b.productLine}",
  tagline: "${b.tagline}",
  googleFontsUrl: "${b.googleFontsUrl}",
  themeColorLight: "${b.themeColorLight}",
  themeColorDark: "${b.themeColorDark}",
  programsTitle: "${b.programsTitle}",
  programsLead: ${JSON.stringify(b.programsLead)},
  programsMeta: ${JSON.stringify(b.programsMeta)},
  programsCardEditor: "${b.programsCardEditor}",
  faqLandingLead: "${b.faqLandingLead}",
  faqPageMeta: ${JSON.stringify(b.faqPageMeta)},
  blogIndexLead: ${JSON.stringify(b.blogIndexLead)},
  blogCtaText: ${JSON.stringify(b.blogCtaText)},
  blogDefaultSection: ${JSON.stringify(b.blogDefaultSection)},
  welcomeDialogTitle: ${JSON.stringify(b.welcomeDialogTitle)},
  featuresVariablesHeading: ${JSON.stringify(b.featuresVariablesHeading)},
};

export function brandWordmark(dotClass = "site-header__dot") {
  return \`\${SITE_BRAND.slug}<span class="\${dotClass}">.</span>\${SITE_BRAND.tld}\`;
}
`;
}

function blogMetaJs() {
  return `/** Site-wide blog metadata (imported by blog/build.mjs). */

export const SITE_URL = "https://${b.domain}";

export const BLOG_META = {
  siteName: "${b.domain}",
  titleSuffix: "${b.domain}",
  description: ${JSON.stringify(b.description)},
  feedTitle: "${b.domain} Blog",
  feedSubtitle: "${b.feedSubtitle}",
  defaultImage:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=630&fit=crop&q=80",
  defaultImageAlt: "Training in a gym",
  author: "James L. Cowan",
  twitter: "@jameslcowan",
};
`;
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="7" fill="${b.iron}"/>
  <rect x="4" y="14" width="24" height="4" rx="1" fill="${b.primary}"/>
  <path d="M8 16v-4M24 16v-4" stroke="${b.chalk}" stroke-width="2.5" stroke-linecap="round"/>
</svg>
`;
}

function llmsTxt() {
  const base = readFileSync(join(REPO, "sites/powerlifting/llms.txt"), "utf8");
  let t = base.replace(/^powerlift\.ing/m, b.domain);
  t = t.replace(
    /Positioning \(simple\)\n[\s\S]*?Coach\/training-partner friendly\./,
    `Positioning (simple)\n${b.llmsPositioning}\n- No signup. No spreadsheets. Works on mobile. Coach/training-partner friendly.`
  );
  t = t.replace(/Common search terms[\s\S]*?Creator/, `Common search terms (what this covers)\n${b.llmsSearchTerms}\n\nCreator`);
  return t;
}

function applyReplacementsToFile(rel) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) return;
  let text = readFileSync(path, "utf8");
  let changed = false;
  for (const [from, to] of b.faqReplacements) {
    const next = text.replace(from, to);
    if (next !== text) {
      text = next;
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(path, text);
    console.log(`  patched ${rel}`);
  }
}

function applyFaqData() {
  const path = join(ROOT, "content/faq-data.js");
  let text = readFileSync(path, "utf8");
  text = text.replace(
    /Answers use "[^"]+" \(not/,
    `Answers use "${b.domain}" (not`
  );
  for (const [from, to] of b.faqReplacements) {
    text = text.replace(from, to);
  }
  writeFileSync(path, text);
  console.log("  patched content/faq-data.js");
}

function patchMarketingCopy() {
  applyReplacementsToFile("index.html");
  patch("app.html", [
    ["Welcome to Powerlift.ing", b.welcomeDialogTitle],
    ["Welcome to powerlift.ing", b.welcomeDialogTitle],
  ]);
  applyReplacementsToFile("content/articles/programming-with-percentages-and-rpe.md");
  applyReplacementsToFile("content/articles/getting-started-with-the-builder.md");
  applyReplacementsToFile("content/articles/how-sharing-works.md");
}

function patchArticles() {
  const dir = join(ROOT, "content/articles");
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    const path = join(dir, file);
    let text = readFileSync(path, "utf8");
    for (const [from, to] of b.faqReplacements) {
      text = text.replace(from, to);
    }
    writeFileSync(path, text);
    console.log(`  patched content/articles/${file}`);
  }
}

function patchIndexHtml() {
  const wm = brandWordmark();
  const menuWm = brandWordmark("site-menu__dot");
  patch("index.html", [
    ["powerlift.ing — Free Powerlifting Program Builder", `${b.domain} — Free ${b.sportTitle} Program Builder`],
    [
      'content="The best free powerlifting program builder. Plan mesocycles, track sets, reps, RPE, and %1RM — then share your whole squat/bench/deadlift program in one link."',
      `content="${b.description}"`,
    ],
    [
      'content="powerlifting program, powerlifting program builder, strength program, workout program, periodization, mesocycle, RPE, squat bench deadlift"',
      `content="${b.keywords}"`,
    ],
    ['href="https://powerlift.ing/"', `href="https://${b.domain}/"`],
    ['content="powerlift.ing"', `content="${b.domain}"`],
    ['title="powerlift.ing Blog"', `title="${b.domain} Blog"`],
    [
      'content="Build powerlifting programs and share them in one link. Free, mobile-first, coach-friendly."',
      `content="${b.ogDescription}"`,
    ],
    ['"name": "powerlift.ing"', `"name": "${b.domain}"`],
    ['"url": "https://powerlift.ing/"', `"url": "https://${b.domain}/"`],
    ['content="https://powerlift.ing/"', `content="https://${b.domain}/"`],
    [
      '"description": "Free powerlifting program builder. Share your workout in one link."',
      `"description": "Free ${b.productShort}. Share your workout in one link."`,
    ],
    [
      "family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap",
      b.googleFontsUrl.split("css2?")[1] || b.googleFontsUrl,
    ],
    [
      'href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap"',
      `href="${b.googleFontsUrl}"`,
    ],
    ['#f5f3ef', b.themeColorLight],
    ['powerlift<span class="site-header__dot">.</span>ing', wm],
    ['powerlift<span class="site-menu__dot">.</span>ing', menuWm],
    [
      `Powerlifting program builder\n            <em>Share your workout in one link</em>`,
      `${b.productLine}\n            <em>${b.heroEm}</em>`,
    ],
    [
      "Plan mesocycles, weeks, and SBD days — sets, reps, load, %1RM, RPE, and rest. Built for the gym floor on your phone.",
      b.heroLead,
    ],
    [
      "Meet prep, hypertrophy, or peaking — without leaving the browser.",
      b.featuresLead,
    ],
    [
      "Hypertrophy, strength, peaking — organize blocks and weeks in one view.",
      b.featuresCard1,
    ],
    [
      "Sets, reps, load (lb/kg), %1RM, RPE, rest, and exercise variations.",
      b.featuresCard2,
    ],
    [
      "Common questions about building, sharing, and using programs on powerlift.ing.",
      b.faqLandingLead,
    ],
    [
      "open up powerlifting knowledge",
      `open up ${b.knowledgePhrase}`,
    ],
    ["© 2026 powerlift.ing", `© 2026 ${b.domain}`],
  ]);
}

function patchAppHtml() {
  patch("app.html", [
    ["Program builder — powerlift.ing", b.appTitle],
    [
      'content="Build and edit powerlifting programs. Mesocycles, weeks, sets, reps, RPE, and shareable program links."',
      `content="${b.appDescription}"`,
    ],
    ['content="powerlift.ing"', `content="${b.domain}"`],
    ['href="https://powerlift.ing/app"', `href="https://${b.domain}/app"`],
    ["powerlift.ing — Free Powerlifting Program Builder", b.appOgTitle],
    [
      "Create and share powerlifting programs instantly. No signup, no spreadsheets — just share a link.",
      b.appOgDescription,
    ],
    ['"name": "powerlift.ing"', `"name": "${b.domain}"`],
    ['"url": "https://powerlift.ing/app"', `"url": "https://${b.domain}/app"`],
    [
      "Create and share powerlifting programs instantly. No signup, no spreadsheets — just share a link. Free tool for athletes, coaches, and training partners.",
      `${b.appOgDescription} Free tool for athletes, coaches, and training partners.`,
    ],
    [
      'href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;600&display=swap"',
      `href="${b.appGoogleFontsUrl}"`,
    ],
    ['powerlift<span class="site-header__dot">.</span>ing', brandWordmark()],
    ['aria-label="powerlift.ing home"', `aria-label="${b.domain} home"`],
    ['powerlift<span class="site-menu__dot">.</span>ing', brandWordmark("site-menu__dot")],
  ]);
}

function patchLegal() {
  let text = readFileSync(join(ROOT, "legal/content.mjs"), "utf8");
  for (const [from, to] of [
    [/powerlift\.ing/g, b.domain],
    [/powerlifting training programs/g, `${b.legalSport} programs`],
    [/powerlifting/g, b.sport],
  ]) {
    text = text.replace(from, to);
  }
  writeFileSync(join(ROOT, "legal/content.mjs"), text);
  console.log("  patched legal/content.mjs");
}

console.log(`\nApplying brand: ${b.domain} → sites/${key}/\n`);

write("design-tokens.css", designTokensCss());
write(
  "fonts.css",
  `/**
 * Font faces — load via <link> in HTML (never @import).
 * Landing: display + sans. App adds JetBrains Mono in app.html.
 */

:root {
  --font-display-fallback: ${b.fontDisplayFallback};
  --font-sans-fallback: ${b.fontSansFallback};
}
`
);
write("content/site-brand.js", siteBrandJs());
write("content/blog-meta.js", blogMetaJs());
write("favicon.svg", faviconSvg());
write("llms.txt", llmsTxt());

applyFaqData();
patchArticles();
patchIndexHtml();
patchAppHtml();
patchLegal();
patchMarketingCopy();

function patchMisc() {
  patch("robots.txt", [[`https://powerlift.ing`, `https://${b.domain}`]]);
  patch("humans.txt", [[`Site: powerlift.ing`, `Site: ${b.domain}`]]);
  patch("landing.css", [[`powerlift.ing landing`, `${b.domain} landing`]]);
  patch("content/programs-data.js", [
    [/powerlift\.ing/g, b.domain],
    [/Full powerlifting/g, "Full strength"],
  ]);
  for (const rel of ["ai.txt", ".well-known/ai.txt", ".well-known/llms.txt"]) {
    const path = join(ROOT, rel);
    if (!existsSync(path)) continue;
    let text = readFileSync(path, "utf8");
    text = text.replace(/powerlift\.ing/g, b.domain);
    text = text.replace(/powerlifting/gi, b.sport);
    writeFileSync(path, text);
    console.log(`  patched ${rel}`);
  }
  let llms = readFileSync(join(ROOT, "llms.txt"), "utf8");
  llms = llms.replace(/https:\/\/powerlift\.ing/g, `https://${b.domain}`);
  writeFileSync(join(ROOT, "llms.txt"), llms);
  console.log("  patched llms.txt (URLs)");
}

patchMisc();

function finalizeDomainRefs() {
  const rels = [
    "index.html",
    "app.html",
    "robots.txt",
    "humans.txt",
    "ai.txt",
    ".well-known/ai.txt",
    ".well-known/llms.txt",
    "llms.txt",
  ];
  for (const rel of rels) {
    const path = join(ROOT, rel);
    if (!existsSync(path)) continue;
    let text = readFileSync(path, "utf8");
    const before = (text.match(/powerlift\.ing/g) || []).length;
    if (!before) continue;
    text = text.replace(/powerlift\.ing/gi, b.domain);
    text = text.replace(/Powerlift\.ing/g, b.domain);
    writeFileSync(path, text);
    console.log(`  finalized ${rel} (${before} → 0)`);
  }
  if (existsSync(join(ROOT, "app.html"))) {
    patch("app.html", [
      [
        'content="powerlifting program, powerlifting program builder, strength program, workout program, periodization, mesocycle, hypertrophy, strength block, peaking, meet prep, RPE, 1RM percentage, squat bench deadlift, training plan, workout planner, free powerlifting app"',
        `content="${b.keywords}"`,
      ],
    ]);
  }
}

finalizeDomainRefs();

const SHARED_FROM_POWERLIFTING = [
  "blog/templates.mjs",
  "blog/build.mjs",
  "blog/schema.mjs",
  "site/footer.mjs",
  "faq/build.mjs",
  "faq/render.mjs",
  "legal/build.mjs",
  "programs/build.mjs",
  "site/build-404.mjs",
];
for (const rel of SHARED_FROM_POWERLIFTING) {
  write(rel, readFileSync(join(REPO, "sites/powerlifting", rel), "utf8"));
}

console.log(`\nDone. Run: npm run build:${key}\n`);
