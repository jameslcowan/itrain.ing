/**
 * Landing-only: hero intro stagger (fonts via fonts-boot.js).
 */
(function () {
  "use strict";
  var root = document.documentElement;

  function markIntroReady() {
    root.classList.add("lp-intro-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markIntroReady, { once: true });
  } else {
    markIntroReady();
  }
})();
