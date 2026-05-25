#!/usr/bin/env node
/** Fail if clone sites still mention powerlift.ing in marketing files. */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLONES = ["powerbuilding", "olympiclifting", "bootybuilding", "itraining"];
const SKIP_DIRS = new Set(["node_modules", ".git"]);
const MARKETING_EXT = new Set([".html", ".md", ".mjs", ".txt", ".xml", ".json"]);
const SKIP_FILES = new Set(["package-lock.json", "app.js", "state-codec.js", "maxes.js", "theme.js", "landing.js"]);
const PATTERN = /powerlift\.ing|Powerlift\.ing|Powerlifting programming/i;

function walk(dir, hits) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) {
      walk(path, hits);
      continue;
    }
    if (SKIP_FILES.has(name)) continue;
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
    if (!MARKETING_EXT.has(ext)) continue;
    const text = readFileSync(path, "utf8");
    if (PATTERN.test(text)) {
      const rel = path.slice(REPO.length + 1);
      const lines = text.split("\n");
      lines.forEach((line, i) => {
        if (PATTERN.test(line)) hits.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`);
      });
    }
  }
}

let failed = false;
for (const site of CLONES) {
  const hits = [];
  walk(join(REPO, "sites", site), hits);
  if (hits.length) {
    failed = true;
    console.error(`\n${site}: ${hits.length} powerlift remnant(s)\n`);
    hits.forEach((h) => console.error(`  ${h}`));
  } else {
    console.log(`OK ${site}`);
  }
}

if (failed) process.exit(1);
