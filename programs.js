/**
 * /programs/ — card dialogs on touch devices; desktop uses hover overlay links.
 */
(() => {
  "use strict";

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const closeBtn = target.closest("[data-dialog-close]");
    if (closeBtn) {
      closeBtn.closest("dialog")?.close();
      return;
    }

    const dialog = target.closest("dialog");
    if (dialog && target === dialog) {
      dialog.close();
      return;
    }

    if (window.matchMedia("(hover: hover)").matches) return;

    const baseCard = target.closest(".prog-card--base");
    if (!baseCard) return;

    const stack = baseCard.closest(".prog-card-stack");
    const modal = stack?.querySelector("dialog.prog-dialog");
    modal?.showModal();
  });
})();
