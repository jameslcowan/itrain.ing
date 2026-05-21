(() => {
  "use strict";

  const sheet = document.getElementById("landingSheet");
  const menuBtn = document.getElementById("landingMenuBtn");
  const closeBtn = document.getElementById("landingSheetClose");
  let returnFocus = null;

  function openSheet() {
    if (!sheet) return;
    returnFocus = document.activeElement;
    sheet.hidden = false;
    menuBtn?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeBtn?.focus(), 0);
  }

  function closeSheet() {
    if (!sheet) return;
    sheet.hidden = true;
    menuBtn?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (returnFocus?.focus) {
      try {
        returnFocus.focus();
      } catch {}
    }
    returnFocus = null;
  }

  menuBtn?.addEventListener("click", openSheet);
  closeBtn?.addEventListener("click", closeSheet);
  sheet?.addEventListener("click", (e) => {
    if (e.target === sheet) closeSheet();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet && !sheet.hidden) closeSheet();
  });

  sheet?.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", () => closeSheet());
  });
})();
