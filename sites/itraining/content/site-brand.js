/** Site brand — marketing shell (imported by templates, footer, builds). */

export const SITE_BRAND = {
  domain: "itrain.ing",
  slug: "itrain",
  wordmarkName: "iTrain",
  tld: "ing",
  siteUrl: "https://itrain.ing",
  productLine: "Training program builder",
  tagline: "Free training program builder. Share whole programs as one open link.",
  googleFontsUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap",
  appGoogleFontsUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@500;600&display=swap",
  themeColorLight: "#f6f6fa",
  themeColorDark: "#0a0a10",
  programsTitle: "Free training programs",
  programsLead: "Free strength templates from itrain.ing. Pick a card, open it in the builder, edit anything, and share your version as one link. Use the <strong>Blank program</strong> card to start from scratch.",
  programsMeta: "Free training program templates on itrain.ing: splits, strength blocks, and peaking templates. Open in the builder and share one link.",
  programsCardEditor: "Open in the itrain.ing editor",
  faqLandingLead: "Common questions about building, sharing, and using programs on itrain.ing",
  faqPageMeta: "Frequently asked questions about itrain.ing: free program builder, open sharing, %1RM maxes, coaches, and technical support.",
  blogIndexLead: "Training programming, how the builder works, and tips for sharing plans with athletes and partners.",
  blogCtaText: "Plan mesocycles, log work with %1RM and RPE, and share one link. Free, no signup.",
  blogDefaultSection: "Training",
  welcomeDialogTitle: "Welcome to itrain.ing",
  featuresVariablesHeading: "Training variables",
};

export function brandWordmark(dotClass = "site-header__dot") {
  const name = SITE_BRAND.wordmarkName ?? SITE_BRAND.slug;
  return `${name}<span class="${dotClass}">.</span>${SITE_BRAND.tld}`;
}
