/** Site brand — marketing shell (imported by templates, footer, builds). */

export const SITE_BRAND = {
  domain: "powerbuild.ing",
  slug: "powerbuild",
  tld: "ing",
  siteUrl: "https://powerbuild.ing",
  productLine: "Powerbuilding program builder",
  tagline: "Free powerbuilding program builder. Share whole programs as one open link.",
  googleFontsUrl: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Source+Sans+3:wght@400;600;700&display=swap",
  themeColorLight: "#f7f5f3",
  themeColorDark: "#0d0d0f",
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
  return `${SITE_BRAND.slug}<span class="${dotClass}">.</span>${SITE_BRAND.tld}`;
}
