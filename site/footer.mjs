/** Shared site footer (marketing pages, app, legal). */

const YEAR = new Date().getFullYear();

export function renderSiteFooter() {
  return `<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__brand">
      <a class="site-footer__logo" href="/">powerlift<span class="site-header__dot">.</span>ing</a>
      <p class="site-footer__tagline">Free powerlifting program builder. Share whole programs as one open link.</p>
    </div>
    <nav class="site-footer__col" aria-label="Product">
      <h2 class="site-footer__heading">Product</h2>
      <ul class="site-footer__list">
        <li><a href="/app">Launch App</a></li>
        <li><a href="/#how-it-works">How it works</a></li>
        <li><a href="/faq/">FAQ</a></li>
      </ul>
    </nav>
    <nav class="site-footer__col" aria-label="Resources">
      <h2 class="site-footer__heading">Resources</h2>
      <ul class="site-footer__list">
        <li><a href="/blog/">Blog</a></li>
      </ul>
    </nav>
    <nav class="site-footer__col" aria-label="Legal">
      <h2 class="site-footer__heading">Legal</h2>
      <ul class="site-footer__list">
        <li><a href="/privacy/">Privacy Policy</a></li>
        <li><a href="/terms/">Terms of Service</a></li>
      </ul>
    </nav>
  </div>
  <div class="site-footer__bottom">
    <p class="site-footer__copy">© ${YEAR} powerlift.ing · Made by <a href="https://x.com/jameslcowan" target="_blank" rel="noopener noreferrer">James L. Cowan</a></p>
  </div>
</footer>`;
}
