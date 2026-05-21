(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function bootFonts() {
    if (!document.fonts?.load) {
      document.documentElement.classList.add("fonts-loaded");
      return;
    }
    Promise.all([
      document.fonts.load('400 1rem "DM Sans"'),
      document.fonts.load('400 1.75rem "Bebas Neue"'),
    ])
      .then(() => document.documentElement.classList.add("fonts-loaded"))
      .catch(() => document.documentElement.classList.add("fonts-loaded"));
  }
  bootFonts();

  if (typeof LZString === "undefined") {
    console.error("LZString not loaded — check /vendor/lz-string.min.js");
  }
  if (typeof PowerliftCodec === "undefined") {
    console.error("PowerliftCodec not loaded — check /state-codec.js");
  }

  const { encodeState, looksLikeProgramV1, urlStateLengthHint } = PowerliftCodec || {};

  const jsonIn = $("jsonIn");
  const outPath = $("outPath");
  const outHash = $("outHash");
  const outBlock = $("outBlock");
  const status = $("status");
  const openInAppBtn = $("openInAppBtn");

  function setStatus(text, kind) {
    status.textContent = text || "";
    status.className = "ai-status" + (kind ? " ai-status--" + kind : "");
  }

  function shareBase() {
    return location.origin.replace(/\/$/, "");
  }

  function generate() {
    setStatus("");
    outBlock.hidden = true;
    outPath.value = "";
    outHash.value = "";
    if (openInAppBtn) {
      openInAppBtn.href = "#";
      openInAppBtn.setAttribute("aria-disabled", "true");
    }

    if (!encodeState || !looksLikeProgramV1) {
      setStatus("Encoder failed to load. Refresh the page.", "err");
      return;
    }
    if (typeof LZString === "undefined") {
      setStatus("Compression library failed to load. Refresh the page.", "err");
      return;
    }

    let obj;
    try {
      obj = JSON.parse(jsonIn.value);
    } catch {
      setStatus("Invalid JSON — fix syntax (missing comma, quote, or bracket) and try again.", "err");
      return;
    }

    if (!looksLikeProgramV1(obj)) {
      setStatus(
        "JSON must be a powerlift.ing program: v:1, u:\"kg\"|\"lb\", c:[mesocycles], weeks:[…]. Use “Insert example” or see Schema below.",
        "err"
      );
      return;
    }

    try {
      const enc = encodeState(obj);
      const base = shareBase();
      const clean = base + "/program/" + enc;
      const legacy = base + "/#/p/" + enc;

      outPath.value = clean;
      outHash.value = legacy;
      outBlock.hidden = false;

      if (openInAppBtn) {
        openInAppBtn.href = clean;
        openInAppBtn.removeAttribute("aria-disabled");
      }

      const hint = urlStateLengthHint?.(enc.length);
      if (hint?.level === "error") {
        setStatus(hint.message, "err");
      } else if (hint?.level === "warn") {
        setStatus("Link generated. " + hint.message, "ok");
      } else {
        setStatus("Link generated. Copy the /program/… URL and share it.", "ok");
      }
    } catch (e) {
      setStatus("Could not encode: " + (e?.message || "unknown error"), "err");
    }
  }

  function prettify() {
    setStatus("");
    try {
      const obj = JSON.parse(jsonIn.value);
      jsonIn.value = JSON.stringify(obj, null, 2);
      setStatus("JSON formatted.", "ok");
    } catch {
      setStatus("Invalid JSON — can’t prettify.", "err");
    }
  }

  async function copyFrom(input) {
    const v = input?.value || "";
    if (!v) {
      setStatus("Nothing to copy — generate a link first.", "err");
      return;
    }
    try {
      await navigator.clipboard.writeText(v);
      setStatus("Copied to clipboard.", "ok");
    } catch {
      input.focus();
      input.select();
      setStatus("Select the field and copy manually (Ctrl+C / ⌘C).", "ok");
    }
  }

  const smallExample = {
    v: 1,
    u: "kg",
    c: [{ n: "Meso 1" }],
    weeks: [
      {
        c: 0,
        days: [
          {
            label: "DAY 1 - MON",
            rows: [
              { ex: "Squat", mode: "", sets: "4", reps: "5", load: "", pct: "", rpe: "7.5", rest: "03:00" },
              { ex: "Bench Press", mode: "", sets: "4", reps: "6", load: "", pct: "", rpe: "7.5", rest: "02:30" },
            ],
          },
          {
            label: "DAY 2 - WED",
            rows: [
              { ex: "Deadlift", mode: "", sets: "3", reps: "5", load: "", pct: "", rpe: "7.5", rest: "03:30" },
            ],
          },
        ],
      },
    ],
  };

  $("encodeBtn")?.addEventListener("click", generate);
  $("prettifyBtn")?.addEventListener("click", prettify);
  $("clearBtn")?.addEventListener("click", () => {
    jsonIn.value = "";
    setStatus("");
    outBlock.hidden = true;
    outPath.value = "";
    outHash.value = "";
    if (openInAppBtn) {
      openInAppBtn.href = "#";
      openInAppBtn.setAttribute("aria-disabled", "true");
    }
  });
  $("exampleBtn")?.addEventListener("click", () => {
    jsonIn.value = JSON.stringify(smallExample, null, 2);
    setStatus("Example inserted. Click “Generate link”.", "ok");
  });
  $("fullExampleBtn")?.addEventListener("click", async () => {
    try {
      const res = await fetch("/ai-example.json");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      jsonIn.value = JSON.stringify(data, null, 2);
      setStatus("Full example loaded. Click “Generate link”.", "ok");
    } catch {
      setStatus("Could not load full example. Use the small example instead.", "err");
    }
  });
  $("copyPathBtn")?.addEventListener("click", () => copyFrom(outPath));
  $("copyHashBtn")?.addEventListener("click", () => copyFrom(outHash));

  jsonIn?.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  });
})();
