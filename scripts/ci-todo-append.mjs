#!/usr/bin/env node
/**
 * Append a CI failure block to docs/CI-TODO.md (idempotent per run URL).
 * Usage: node scripts/ci-todo-append.mjs /path/to/block.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const todoPath = path.join(__dirname, '..', 'docs', 'CI-TODO.md');
const blockPath = process.argv[2];

if (!blockPath) {
  console.error('Usage: node scripts/ci-todo-append.mjs <block.md>');
  process.exit(1);
}

const block = fs.readFileSync(blockPath, 'utf8').trim();
const runUrl = block.match(/\[logs\]\((https:\/\/[^)]+)\)/)?.[1];

let doc = fs.readFileSync(todoPath, 'utf8');

if (runUrl && doc.includes(runUrl)) {
  console.log('CI-TODO.md already contains this run; skipping duplicate');
  process.exit(0);
}

const marker = '## Open failures (newest first)';
if (!doc.includes(marker)) {
  doc += `\n${marker}\n\n`;
}

const insertAt = doc.indexOf(marker) + marker.length;
doc = doc.slice(0, insertAt) + '\n\n' + block + '\n' + doc.slice(insertAt);

fs.writeFileSync(todoPath, doc);
console.log('Updated', todoPath);
