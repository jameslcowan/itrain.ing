/** Site brand — marketing shell (imported by templates, footer, builds). */

export const SITE_BRAND = {
  domain: "powerbuild.ing",
  slug: "powerbuild",
  wordmarkName: "Powerbuild",
  tld: "ing",
  siteUrl: "https://powerbuild.ing",
  productLine: "Powerbuilding program builder",
  tagline: "Free powerbuilding program builder. Share whole programs as one open link.",
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Share+Tech&family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap",
  appGoogleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Share+Tech&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@500;600&display=swap",
  themeColorLight: "#f5f2ee",
  themeColorDark: "#0a0a0c",
  programsTitle: "Free powerbuilding programs",
  programsLead: "Free strength and hypertrophy templates from powerbuild.ing. Pick a card, open it in the builder, edit anything, and share your version as one link. Use the <strong>Blank program</strong> card to start from scratch.",
  programsMeta: "Free powerbuilding program templates on powerbuild.ing: splits, volume blocks, and strength templates. Open in the builder and share one link.",
  programsCardEditor: "Open in the powerbuild.ing editor",
  faqLandingLead: "Common questions about building, sharing, and using programs on powerbuild.ing.",
  faqPageMeta: "Frequently asked questions about powerbuild.ing: free program builder, open sharing, %1RM maxes, coaches, and technical support.",
  blogIndexLead: "Powerbuilding programming, how the builder works, and tips for sharing training plans.",
  blogCtaText: "Plan mesocycles, log sets with %1RM and RPE, and share one link. Free, no signup.",
  blogDefaultSection: "Powerbuilding",
  welcomeDialogTitle: "Welcome to powerbuild.ing",
  featuresVariablesHeading: "Training variables",
};

export function brandWordmark(dotClass = "site-header__dot") {
  const name = SITE_BRAND.wordmarkName ?? SITE_BRAND.slug;
  return `${name}<span class="${dotClass}">.</span>${SITE_BRAND.tld}`;
}
