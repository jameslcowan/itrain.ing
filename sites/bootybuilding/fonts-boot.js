/**
 * Load display + body fonts before menu/hero render (landing + app).
 */
(function () {
  "use strict";
  var root = document.documentElement;

  function markFontsLoaded() {
    root.classList.add("fonts-loaded");
  }

  if (!document.fonts || !document.fonts.load) {
    markFontsLoaded();
    return;
  }

  Promise.all([
    document.fonts.load('400 1rem "DM Sans"'),
    document.fonts.load('400 2.25rem "Bebas Neue"'),
  ])
    .then(markFontsLoaded)
    .catch(markFontsLoaded);

  setTimeout(markFontsLoaded, 2200);
})();
