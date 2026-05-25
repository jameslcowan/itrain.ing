/** Site brand — marketing shell (imported by templates, footer, builds). */

export const SITE_BRAND = {
  domain: "bootybuild.ing",
  slug: "bootybuild",
  tld: "ing",
  siteUrl: "https://bootybuild.ing",
  productLine: "Glute program builder",
  tagline: "Free glute program builder. Share whole programs as one open link.",
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
  appGoogleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@500;600&display=swap",
  themeColorLight: "#f8f4fc",
  themeColorDark: "#08040c",
  programsTitle: "Free glute & leg programs",
  programsLead: "Free lower-body templates from bootybuild.ing. Pick a card, open it in the builder, edit anything, and share your version as one link. Use the <strong>Blank program</strong> card to start from scratch.",
  programsMeta: "Free glute and leg program templates on bootybuild.ing: hip thrusts, RDLs, splits, and more. Open in the builder and share one link.",
  programsCardEditor: "Open in the bootybuild.ing editor",
  faqLandingLead: "Common questions about building, sharing, and using programs on bootybuild.ing.",
  faqPageMeta: "Frequently asked questions about bootybuild.ing: free program builder, open sharing, %1RM maxes, coaches, and technical support.",
  blogIndexLead: "Glute-focused programming, the builder, and shareable leg-day blocks.",
  blogCtaText: "Plan mesocycles, log lower-body work with %1RM and RPE, and share one link. Free, no signup.",
  blogDefaultSection: "Glute training",
  welcomeDialogTitle: "Welcome to bootybuild.ing",
  featuresVariablesHeading: "Training variables",
};

export function brandWordmark(dotClass = "site-header__dot") {
  return `${SITE_BRAND.slug}<span class="${dotClass}">.</span>${SITE_BRAND.tld}`;
}
