(() => {
  "use strict";

  const root = document.body;
  const menu = document.getElementById("landingMenu");
  const menuBtn = document.getElementById("landingMenuBtn");
  const menuClose = document.getElementById("landingMenuClose");
  let returnFocus = null;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function openMenu() {
    if (!menu) return;
    returnFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(() => {
      menu.classList.add("is-open");
    });
    menuBtn?.setAttribute("aria-expanded", "true");
    root.classList.add("lp-menu-open");
    root.style.overflow = "hidden";
    window.setTimeout(() => menuClose?.focus(), 50);
  }

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    menuBtn?.setAttribute("aria-expanded", "false");
    root.classList.remove("lp-menu-open");
    root.style.overflow = "";

    const finish = () => {
      menu.hidden = true;
      if (returnFocus?.focus) {
        try {
          returnFocus.focus();
        } catch {}
      }
      returnFocus = null;
    };

    if (prefersReducedMotion) {
      finish();
      return;
    }

    const onEnd = (e) => {
      if (e.target !== menu) return;
      menu.removeEventListener("transitionend", onEnd);
      finish();
    };
    menu.addEventListener("transitionend", onEnd);
    window.setTimeout(finish, 350);
  }

  menuBtn?.addEventListener("click", openMenu);
  menuClose?.addEventListener("click", closeMenu);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu && !menu.hidden) closeMenu();
  });

  menu?.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });

  function scrollToSection(id) {
    const el = document.querySelector(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", id);
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      scrollToSection(id);
    });
  });

  // Sticky dock: only after hero scrolls away (avoids duplicate CTA on first screen)
  const dock = document.querySelector(".lp-dock");
  const hero = document.querySelector(".lp-hero");
  if (dock && hero) {
    const updateDock = () => {
      const show = hero.getBoundingClientRect().bottom < 8;
      dock.classList.toggle("is-visible", show);
      root.classList.toggle("lp-dock-visible", show);
    };
    updateDock();
    window.addEventListener("scroll", updateDock, { passive: true });
  }

  // Scroll reveal (Intersection Observer)
  const revealEls = document.querySelectorAll(".lp-reveal");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        },
        {
          root: null,
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.12,
        }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }
})();
