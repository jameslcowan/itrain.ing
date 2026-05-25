/**
 * Load display + body fonts before menu/hero render (landing + app).
 * Families come from design-tokens.css (--sans, --font-display, --mono).
 */
(function () {
  "use strict";
  var root = document.documentElement;

  function markFontsLoaded() {
    root.classList.add("fonts-loaded");
  }

  function primaryFamily(cssProp) {
    var raw = getComputedStyle(root).getPropertyValue(cssProp).trim();
    if (!raw) return "";
    var first = raw.split(",")[0].trim();
    return first.replace(/^['"]|['"]$/g, "");
  }

  if (!document.fonts || !document.fonts.load) {
    markFontsLoaded();
    return;
  }

  var sans = primaryFamily("--sans");
  var display = primaryFamily("--font-display");
  var mono = primaryFamily("--mono");
  var loads = [];
  if (sans) loads.push(document.fonts.load('400 1rem "' + sans + '"'));
  if (display) loads.push(document.fonts.load('600 2.25rem "' + display + '"'));
  if (mono) loads.push(document.fonts.load('600 1rem "' + mono + '"'));

  if (!loads.length) {
    markFontsLoaded();
    return;
  }

  Promise.all(loads).then(markFontsLoaded).catch(markFontsLoaded);
  setTimeout(markFontsLoaded, 2200);
})();
