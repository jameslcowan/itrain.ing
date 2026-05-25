/** Site brand — marketing shell (imported by templates, footer, builds). */

export const SITE_BRAND = {
  domain: "olympiclift.ing",
  slug: "olympiclift",
  wordmarkName: "Olympiclift",
  tld: "ing",
  siteUrl: "https://olympiclift.ing",
  productLine: "Olympic lifting program builder",
  tagline: "Free Olympic lifting program builder. Share whole programs as one open link.",
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Finlandica:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap",
  appGoogleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Finlandica:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@500;600&display=swap",
  themeColorLight: "#f4f6fa",
  themeColorDark: "#0c0e14",
  programsTitle: "Free Olympic lifting programs",
  programsLead:
    "Free weightlifting templates from olympiclift.ing. Pick a card, open it in the builder, edit anything, and share your version as one link. Use the <strong>Blank program</strong> card to start from scratch.",
  programsMeta:
    "Free Olympic lifting program templates on olympiclift.ing: technique weeks, strength blocks, and more. Open in the builder and share one link.",
  programsCardEditor: "Open in the olympiclift.ing editor",
  faqLandingLead: "Common questions about building, sharing, and using programs on olympiclift.ing.",
  faqPageMeta:
    "Frequently asked questions about olympiclift.ing: free program builder, open sharing, %1RM maxes, coaches, and technical support.",
  blogIndexLead: "Olympic lifting programming, the builder, and shareable training weeks.",
  blogCtaText: "Plan mesocycles, log snatch and C&J work with %1RM and RPE, and share one link. Free, no signup.",
  blogDefaultSection: "Olympic lifting",
  welcomeDialogTitle: "Welcome to olympiclift.ing",
  featuresVariablesHeading: "Lift variables",
};

export function brandWordmark(dotClass = "site-header__dot") {
  const name = SITE_BRAND.wordmarkName ?? SITE_BRAND.slug;
  return `${name}<span class="${dotClass}">.</span>${SITE_BRAND.tld}`;
}
