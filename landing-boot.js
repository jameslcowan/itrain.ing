/**
 * Early boot: font readiness + hero intro (runs in <head>, before paint-heavy defer scripts).
 */
(function () {
  "use strict";
  var root = document.documentElement;

  function markFontsLoaded() {
    root.classList.add("fonts-loaded");
  }

  function markIntroReady() {
    root.classList.add("lp-intro-ready");
  }

  function boot() {
    markIntroReady();
  }

  if (!document.fonts || !document.fonts.load) {
    markFontsLoaded();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
      boot();
    }
    return;
  }

  var fontReady = Promise.all([
    document.fonts.load('400 1rem "DM Sans"'),
    document.fonts.load('400 2.25rem "Bebas Neue"'),
  ])
    .then(markFontsLoaded)
    .catch(markFontsLoaded);

  var introReady =
    document.readyState === "loading"
      ? new Promise(function (resolve) {
          document.addEventListener("DOMContentLoaded", resolve, { once: true });
        })
      : Promise.resolve();

  Promise.all([fontReady, introReady]).then(boot);

  setTimeout(function () {
    markFontsLoaded();
    boot();
  }, 2200);
})();
