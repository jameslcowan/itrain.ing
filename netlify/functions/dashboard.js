import {
  adminToken,
  isAuthorizedEvent,
} from './lib/analytics-session.mjs';

const GITHUB_API = 'https://api.github.com';
const LOGIN_PATH = '/.netlify/functions/analytics-login';

function daysAgo(n) {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function datePathParts(date) {
  const [year, month, day] = date.split('-');
  return { year, month: String(parseInt(month)), day: String(parseInt(day)) };
}

async function fetchSummary(date, token, owner, repo, branch) {
  const { year, month, day } = datePathParts(date);
  for (const suffix of ['analytics-scheduled.json', 'analytics-manual.json']) {
    const path = `analytics/${year}/${month}/${day}/${suffix}`;
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3.raw',
          'User-Agent': 'powerlift-ing-analytics-dashboard',
        },
      });
      if (res.ok) return await res.json();
    } catch {
      // try next
    }
  }
  return null;
}

function sparkline(values) {
  const bars = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];
  const max = Math.max(...values.filter((v) => v != null), 1);
  return values
    .map((v) => (v == null ? '\u2581' : bars[Math.min(Math.floor((v / max) * 7), 7)]))
    .join('');
}

function pctBadge(pct) {
  if (pct == null) return '<span style="opacity:0.5;">n/a</span>';
  const color = pct >= 0 ? '#22c55e' : '#ef4444';
  const arrow = pct >= 0 ? '\u25b2' : '\u25bc';
  return `<span style="color:${color};">${arrow} ${Math.abs(pct)}%</span>`;
}

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const handler = async (event) => {
  if (!adminToken()) {
    return { statusCode: 500, body: 'Server configuration error: ANALYTICS_ADMIN_TOKEN not set' };
  }

  if (!isAuthorizedEvent(event).ok) {
    return {
      statusCode: 302,
      headers: { Location: LOGIN_PATH },
    };
  }

  const ghToken = process.env.GITHUB_TOKEN;
  const repoFull = process.env.GITHUB_ANALYTICS_REPO;
  const branch = process.env.GITHUB_ANALYTICS_BRANCH || 'main';

  if (!ghToken || !repoFull) {
    return { statusCode: 500, body: 'Server config error: missing GitHub credentials' };
  }

  const [owner, repo] = repoFull.split('/');
  const days = 14;
  const dates = Array.from({ length: days }, (_, i) => daysAgo(i + 1));
  const summaries = await Promise.all(dates.map((d) => fetchSummary(d, ghToken, owner, repo, branch)));

  const dailyData = dates
    .map((date, i) => ({
      date,
      events: summaries[i]?.meta?.events ?? 0,
      visitors: summaries[i]?.meta?.uniqueVisitors ?? 0,
      medianLCP: summaries[i]?.performance?.medianLCP ?? null,
      p95LCP: summaries[i]?.performance?.p95LCP ?? null,
      medianTTFB: summaries[i]?.performance?.medianTTFB ?? null,
      p95TTFB: summaries[i]?.performance?.p95TTFB ?? null,
    }))
    .reverse();

  const thisWeek = summaries.slice(0, 7).filter(Boolean);
  const prevWeek = summaries.slice(7, 14).filter(Boolean);
  const sumField = (arr, fn) => arr.reduce((t, s) => t + (fn(s) || 0), 0);
  const tw = {
    events: sumField(thisWeek, (s) => s.meta?.events),
    visitors: sumField(thisWeek, (s) => s.meta?.uniqueVisitors),
  };
  const pw = {
    events: sumField(prevWeek, (s) => s.meta?.events),
    visitors: sumField(prevWeek, (s) => s.meta?.uniqueVisitors),
  };
  const pctChange = (c, p) => (p ? Math.round(((c - p) / p) * 100) : null);

  const pathCounts = {};
  const refCounts = {};
  for (const s of thisWeek) {
    for (const p of s.traffic?.topPaths || []) {
      pathCounts[p.key] = (pathCounts[p.key] || 0) + p.count;
    }
    for (const r of s.traffic?.referrers || []) {
      refCounts[r.key] = (refCounts[r.key] || 0) + r.count;
    }
  }
  const topPages = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const topRefs = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const eventsSparkline = sparkline(dailyData.map((d) => d.events));
  const visitorsSparkline = sparkline(dailyData.map((d) => d.visitors));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Analytics · powerlift.ing</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; background: light-dark(#f5f3ef, #0d0d0f); color: light-dark(#1a1a1a, #f5f3ef); }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { font-size: 0.8rem; opacity: 0.7; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { padding: 1rem 1.25rem; border: 1px solid light-dark(#ddd, #333); border-radius: 8px; background: light-dark(#fff, #1a1a1e); }
    .card-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.65; margin-bottom: 0.25rem; }
    .card-value { font-size: 1.75rem; font-weight: 700; }
    .card-sub { font-size: 0.75rem; margin-top: 0.25rem; }
    .sparkline { font-size: 1.1rem; letter-spacing: 1px; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 2rem; }
    th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.65; padding: 0.5rem 0.75rem; border-bottom: 1px solid light-dark(#ddd, #333); }
    td { padding: 0.5rem 0.75rem; border-bottom: 1px solid light-dark(#ddd, #333); }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    h2 { font-size: 1.1rem; margin: 2rem 0 0.75rem; }
  </style>
</head>
<body>
  <h1>powerlift.ing analytics</h1>
  <p class="subtitle">Last 14 days &middot; ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</p>

  <div class="grid">
    <div class="card">
      <div class="card-label">Events (7d)</div>
      <div class="card-value">${tw.events.toLocaleString()}</div>
      <div class="card-sub">WoW: ${pctBadge(pctChange(tw.events, pw.events))}</div>
      <div class="sparkline">${eventsSparkline}</div>
    </div>
    <div class="card">
      <div class="card-label">Visitors (7d)</div>
      <div class="card-value">${tw.visitors.toLocaleString()}</div>
      <div class="card-sub">WoW: ${pctBadge(pctChange(tw.visitors, pw.visitors))}</div>
      <div class="sparkline">${visitorsSparkline}</div>
    </div>
    <div class="card">
      <div class="card-label">Avg events/day</div>
      <div class="card-value">${thisWeek.length ? Math.round(tw.events / thisWeek.length) : 0}</div>
    </div>
    <div class="card">
      <div class="card-label">Avg visitors/day</div>
      <div class="card-value">${thisWeek.length ? Math.round(tw.visitors / thisWeek.length) : 0}</div>
    </div>
  </div>

  <h2>Daily breakdown</h2>
  <table>
    <thead>
      <tr><th>Date</th><th class="num">Events</th><th class="num">Visitors</th><th class="num">LCP p50</th><th class="num">LCP p95</th><th class="num">TTFB p50</th></tr>
    </thead>
    <tbody>
      ${dailyData
        .map(
          (d) => `<tr>
        <td>${d.date}</td>
        <td class="num">${d.events}</td>
        <td class="num">${d.visitors}</td>
        <td class="num">${d.medianLCP != null ? `${d.medianLCP.toFixed(0)}ms` : '-'}</td>
        <td class="num">${d.p95LCP != null ? `${d.p95LCP.toFixed(0)}ms` : '-'}</td>
        <td class="num">${d.medianTTFB != null ? `${d.medianTTFB.toFixed(0)}ms` : '-'}</td>
      </tr>`,
        )
        .join('\n      ')}
    </tbody>
  </table>

  <h2>Top pages (7d)</h2>
  <table>
    <thead><tr><th>Path</th><th class="num">Views</th></tr></thead>
    <tbody>
      ${topPages.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${v}</td></tr>`).join('\n      ')}
      ${topPages.length === 0 ? '<tr><td colspan="2">No data yet</td></tr>' : ''}
    </tbody>
  </table>

  ${
    topRefs.length > 0
      ? `<h2>Top referrers (7d)</h2>
  <table>
    <thead><tr><th>Referrer</th><th class="num">Count</th></tr></thead>
    <tbody>
      ${topRefs.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${v}</td></tr>`).join('\n      ')}
    </tbody>
  </table>`
      : ''
  }

</body>
</html>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html,
  };
};
