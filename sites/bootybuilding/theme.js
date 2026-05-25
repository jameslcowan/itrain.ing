/**
 * Shared light/dark theme (localStorage key pli_theme). Load in <head> on every page.
 */
(() => {
  "use strict";

  const THEME_KEY = "pli_theme";
  const mediaDark = window.matchMedia?.("(prefers-color-scheme: dark)");

  function getStoredTheme() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      if (v === "dark" || v === "light") return v;
      return null;
    } catch {
      return null;
    }
  }

  function setStoredTheme(v) {
    try {
      if (v === "dark" || v === "light") localStorage.setItem(THEME_KEY, v);
      else localStorage.removeItem(THEME_KEY);
    } catch {}
  }

  function getEffectiveTheme() {
    const stored = getStoredTheme();
    if (stored) return stored;
    return mediaDark && mediaDark.matches ? "dark" : "light";
  }

  function applyTheme(themeOrNull) {
    const html = document.documentElement;
    if (themeOrNull === "dark" || themeOrNull === "light") html.setAttribute("data-theme", themeOrNull);
    else html.removeAttribute("data-theme");
  }

  function updateThemeIcon(themeIcon) {
    if (!themeIcon) return;
    const effective = getEffectiveTheme();
    const href = effective === "dark" ? "#i-dark-mode" : "#i-light-mode";
    themeIcon.setAttribute("href", href);
    try {
      themeIcon.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", href);
    } catch {}
  }

  function syncToggleUi(themeToggleBtn, themeIcon) {
    if (!themeToggleBtn) return;
    const effective = getEffectiveTheme();
    themeToggleBtn.setAttribute("aria-label", effective === "dark" ? "Switch to light mode" : "Switch to dark mode");
    themeToggleBtn.title = effective === "dark" ? "Light mode" : "Dark mode";
    updateThemeIcon(themeIcon);
  }

  function bindToggle(themeToggleBtn, themeIcon) {
    if (!themeToggleBtn) return;
    syncToggleUi(themeToggleBtn, themeIcon);
    themeToggleBtn.addEventListener("click", () => {
      const next = getEffectiveTheme() === "dark" ? "light" : "dark";
      setStoredTheme(next);
      applyTheme(next);
      syncToggleUi(themeToggleBtn, themeIcon);
    });
  }

  // Apply before first paint when this script runs from <head>
  applyTheme(getStoredTheme());

  mediaDark?.addEventListener?.("change", () => {
    if (!getStoredTheme()) applyTheme(null);
  });

  window.PowerliftTheme = {
    THEME_KEY,
    getStoredTheme,
    setStoredTheme,
    getEffectiveTheme,
    applyTheme,
    updateThemeIcon,
    syncToggleUi,
    bindToggle,
  };
})();
