/**
 * /programs/ — program card dialogs (open trigger + full-screen on mobile).
 */
(() => {
  "use strict";

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const openTrigger = target.closest("[data-dialog-open]");
    if (openTrigger) {
      openTrigger.closest(".prog-card-stack")?.querySelector("dialog.prog-dialog")?.showModal();
      return;
    }

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

    /* Touch: tap card body opens dialog (whole card, not only the overlay button) */
    if (window.matchMedia("(hover: hover)").matches) return;

    if (target.closest(".prog-dialog__open, [data-dialog-open], [data-dialog-close]")) return;

    const baseCard = target.closest(".prog-card--base");
    if (!baseCard) return;

    baseCard.closest(".prog-card-stack")?.querySelector("dialog.prog-dialog")?.showModal();
  });
})();
