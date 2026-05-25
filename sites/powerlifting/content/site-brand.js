/** Site brand — marketing shell (imported by templates, footer, builds). */

export const SITE_BRAND = {
  domain: "powerlift.ing",
  slug: "powerlift",
  tld: "ing",
  siteUrl: "https://powerlift.ing",
  productLine: "Powerlifting program builder",
  tagline: "Free powerlifting program builder. Share whole programs as one open link.",
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap",
  themeColorLight: "#f5f3ef",
  themeColorDark: "#0d0d0f",
  programsTitle: "Free powerlifting programs",
  programsLead:
    "Free powerlifting templates from powerlift.ing. Pick a card, open it in the builder, edit anything, and share your version as one link. Use the <strong>Blank program</strong> card to start from scratch.",
  programsMeta:
    "Free powerlifting program templates on powerlift.ing: 3-day SBD, 5/3/1, bench focus, meet prep, and more. Open in the builder and share one link.",
  programsCardEditor: "Open in the powerlift.ing editor",
  faqLandingLead: "Common questions about building, sharing, and using programs on powerlift.ing.",
  faqPageMeta:
    "Frequently asked questions about powerlift.ing: free program builder, open sharing, %1RM maxes, coaches, and technical support.",
};

export function brandWordmark(dotClass = "site-header__dot") {
  return `${SITE_BRAND.slug}<span class="${dotClass}">.</span>${SITE_BRAND.tld}`;
}
