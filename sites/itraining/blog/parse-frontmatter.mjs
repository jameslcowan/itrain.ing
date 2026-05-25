/** Minimal YAML-like frontmatter parser for blog posts. */

export function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) throw new Error("No frontmatter found");
  const frontmatter = {};
  const lines = match[1].split("\n");
  let currentKey = null;
  let currentValue = [];

  const flush = () => {
    if (!currentKey) return;
    frontmatter[currentKey] =
      currentValue.length > 1 ? currentValue : currentValue.length === 1 ? currentValue[0] : "";
    currentKey = null;
    currentValue = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const keyMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (keyMatch) {
      flush();
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();
      if (!value) {
        currentValue = [];
      } else if (value.startsWith("-")) {
        currentValue = [value.slice(1).trim()];
      } else {
        let cleaned = value;
        if (
          (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
          (cleaned.startsWith("'") && cleaned.endsWith("'"))
        ) {
          cleaned = cleaned.slice(1, -1);
        }
        currentValue = [cleaned];
      }
    } else if (trimmed.startsWith("-") && currentKey) {
      currentValue.push(trimmed.slice(1).trim());
    } else if (currentKey) {
      if (currentValue.length === 0) currentValue = [trimmed];
      else currentValue[currentValue.length - 1] += ` ${trimmed}`;
    }
  }
  flush();
  return { frontmatter, content: match[2] };
}

export function parseFrontmatterDateToUtcTimestamp(dateString) {
  if (!dateString) return 0;
  const raw = String(dateString).trim();
  if (!raw) return 0;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return Date.parse(`${raw}T00:00:00Z`) || 0;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw) && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw)) {
    return Date.parse(`${raw}Z`) || 0;
  }
  return Date.parse(raw) || 0;
}

export function formatDisplayDate(dateString) {
  const ts = parseFrontmatterDateToUtcTimestamp(dateString);
  if (!ts) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(ts));
}
