import { Buffer } from 'node:buffer';

import { connectLambda, getStore } from '@netlify/blobs';
import { schedule } from '@netlify/functions';

import { adminToken } from './lib/analytics-session.mjs';

let cachedStore;

function getAnalyticsStore() {
  if (!cachedStore) {
    cachedStore = getStore('analytics-events');
  }
  return cachedStore;
}

function parseBody(event) {
  if (!event?.body) return null;
  try {
    return JSON.parse(event.body);
  } catch {
    return null;
  }
}

function parseDateOverride(event, body) {
  const date = event.queryStringParameters?.date || body?.date;
  if (!date) return null;
  return date;
}

function getTargetDate(event, body) {
  const override = parseDateOverride(event, body);
  if (override) return override;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return yesterday.toISOString().slice(0, 10);
}

function countOccurrences(items) {
  return items.reduce((acc, item) => {
    if (!item) return acc;
    const key = item.toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sortCounts(counts, limit = 10) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

function daysAgo(targetDate, n) {
  const d = new Date(targetDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function fetchGitHubSummary(date) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_ANALYTICS_REPO;
  const branch = process.env.GITHUB_ANALYTICS_BRANCH || 'main';
  if (!token || !repo) return null;

  const [owner, repoName] = repo.split('/');
  const { year, month, day } = datePathParts(date);

  for (const suffix of ['-scheduled', '-manual']) {
    const path = `analytics/${year}/${month}/${day}/analytics${suffix}.json`;
    const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${branch}`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3.raw',
          'User-Agent': 'netlify-analytics-rollup',
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // continue to next suffix
    }
  }
  return null;
}

function computeDeltas(todaySummary, last7Summaries, prevWeekSummaries) {
  const sum = (arr, fn) => arr.reduce((t, s) => t + (fn(s) || 0), 0);

  const todayEvents = todaySummary.meta.events;
  const todayVisitors = todaySummary.meta.uniqueVisitors;

  const last7Events = sum(last7Summaries, s => s?.meta?.events);
  const last7Visitors = sum(last7Summaries, s => s?.meta?.uniqueVisitors);
  const last7Days = last7Summaries.filter(Boolean).length;

  const prevWeekEvents = sum(prevWeekSummaries, s => s?.meta?.events);
  const prevWeekVisitors = sum(prevWeekSummaries, s => s?.meta?.uniqueVisitors);
  const prevWeekDays = prevWeekSummaries.filter(Boolean).length;

  const pctChange = (current, previous) => {
    if (!previous) return null;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    last7Days: {
      totalEvents: last7Events,
      totalVisitors: last7Visitors,
      daysWithData: last7Days,
      avgEventsPerDay: last7Days ? Math.round(last7Events / last7Days) : null,
      avgVisitorsPerDay: last7Days ? Math.round(last7Visitors / last7Days) : null,
    },
    weekOverWeek: {
      eventsChange: pctChange(last7Events, prevWeekEvents),
      visitorsChange: pctChange(last7Visitors, prevWeekVisitors),
      thisWeekEvents: last7Events,
      prevWeekEvents,
      thisWeekVisitors: last7Visitors,
      prevWeekVisitors,
    },
  };
}

const ALERT_THRESHOLDS = {
  wowEventsDrop: -50,    // alert if WoW events drop more than 50%
  wowVisitorsDrop: -50,  // alert if WoW visitors drop more than 50%
  p95LCPSpike: 4000,     // alert if p95 LCP exceeds 4 seconds
  p95TTFBSpike: 2000,    // alert if p95 TTFB exceeds 2 seconds
};

async function checkAndAlert(summary) {
  const apiKey = process.env.BREVO_API_KEY;
  const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL || 'admin@powerlift.ing';
  if (!apiKey) return;

  const alerts = [];
  const deltas = summary.deltas;
  const perf = summary.performance;

  if (deltas?.weekOverWeek?.eventsChange != null && deltas.weekOverWeek.eventsChange <= ALERT_THRESHOLDS.wowEventsDrop) {
    alerts.push(`Traffic drop: events down ${Math.abs(deltas.weekOverWeek.eventsChange)}% week-over-week (${deltas.weekOverWeek.prevWeekEvents} -> ${deltas.weekOverWeek.thisWeekEvents})`);
  }
  if (deltas?.weekOverWeek?.visitorsChange != null && deltas.weekOverWeek.visitorsChange <= ALERT_THRESHOLDS.wowVisitorsDrop) {
    alerts.push(`Visitor drop: unique visitors down ${Math.abs(deltas.weekOverWeek.visitorsChange)}% week-over-week (${deltas.weekOverWeek.prevWeekVisitors} -> ${deltas.weekOverWeek.thisWeekVisitors})`);
  }
  if (perf?.p95LCP != null && perf.p95LCP > ALERT_THRESHOLDS.p95LCPSpike) {
    alerts.push(`LCP spike: p95 LCP at ${perf.p95LCP.toFixed(0)}ms (threshold: ${ALERT_THRESHOLDS.p95LCPSpike}ms)`);
  }
  if (perf?.p95TTFB != null && perf.p95TTFB > ALERT_THRESHOLDS.p95TTFBSpike) {
    alerts.push(`TTFB spike: p95 TTFB at ${perf.p95TTFB.toFixed(0)}ms (threshold: ${ALERT_THRESHOLDS.p95TTFBSpike}ms)`);
  }

  if (alerts.length === 0) return;

  const subject = `[powerlift.ing] Analytics alert - ${summary.meta.date}`;
  const textContent = `Analytics alerts for ${summary.meta.date}:\n\n${alerts.map(a => '- ' + a).join('\n')}\n\nDaily summary: ${summary.meta.events} events, ${summary.meta.uniqueVisitors} unique visitors.`;
  const htmlContent = `<h2>Analytics alerts for ${summary.meta.date}</h2><ul>${alerts.map(a => `<li>${a}</li>`).join('')}</ul><p>Daily summary: ${summary.meta.events} events, ${summary.meta.uniqueVisitors} unique visitors.</p>`;

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'powerlift.ing analytics', email: 'james@kleto.com' },
        to: [{ email: notifyEmail }],
        subject,
        textContent,
        htmlContent,
      }),
    });
    console.info('[rollup] alert sent', { alerts: alerts.length });
  } catch (err) {
    console.warn('[rollup] alert send failed', err.message);
  }
}

function normalizePath(url) {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    return url;
  }
}

function buildSummary(events, targetDate, metadata = {}) {
  const uniqueVisitors = new Set(events.map((evt) => evt.visitor?.id).filter(Boolean));
  const pathCounts = countOccurrences(events.map((evt) => normalizePath(evt.page?.url || evt.page?.path)));
  const referrers = countOccurrences(events.map((evt) => evt.referrer?.domain).filter(Boolean));
  const utmSources = countOccurrences(events.map((evt) => evt.referrer?.utm?.utm_source).filter(Boolean));
  const devices = countOccurrences(events.map((evt) => evt.visitor?.deviceType).filter(Boolean));
  const performanceValues = {
    ttfb: events.map((evt) => evt.performance?.ttfb).filter((val) => typeof val === 'number'),
    lcp: events.map((evt) => evt.performance?.lcp).filter((val) => typeof val === 'number'),
  };

  return {
    meta: {
      date: targetDate,
      events: events.length,
      uniqueVisitors: uniqueVisitors.size,
      generatedAt: new Date().toISOString(),
      ...metadata,
    },
    traffic: {
      topPaths: sortCounts(pathCounts),
      referrers: sortCounts(referrers),
      utmSources: sortCounts(utmSources),
      devices: sortCounts(devices, 3),
    },
    performance: {
      medianTTFB: percentile(performanceValues.ttfb, 50),
      p95TTFB: percentile(performanceValues.ttfb, 95),
      medianLCP: percentile(performanceValues.lcp, 50),
      p95LCP: percentile(performanceValues.lcp, 95),
    },
    events,
  };
}

async function fetchEvents(store, targetDate) {
  const prefix = `queue/${targetDate}/`;
  const events = [];
  const keys = [];

  for await (const page of store.list({ prefix, paginate: true })) {
    for (const blob of page.blobs) {
      const data = await store.get(blob.key, { type: 'json' });
      if (data) {
        events.push(data);
      }
      keys.push(blob.key);
    }
  }

  return { events, keys };
}

function datePathParts(targetDate) {
  const [year, month, day] = targetDate.split('-');
  return {
    year,
    month: month.replace(/^0/, '') || '0',
    day: day.replace(/^0/, '') || '0',
  };
}

async function commitToGitHub(content, targetDate, runType) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_ANALYTICS_REPO;
  const branch = process.env.GITHUB_ANALYTICS_BRANCH || 'main';

  if (!token || !repo) {
    throw new Error('GITHUB_TOKEN and GITHUB_ANALYTICS_REPO must be set');
  }

  const [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    throw new Error('GITHUB_ANALYTICS_REPO must be in the form owner/repo');
  }

  const { year, month, day } = datePathParts(targetDate);
  const suffix = runType === 'manual' ? '-manual' : '-scheduled';
  const path = `analytics/${year}/${month}/${day}/analytics${suffix}.json`;
  const apiPath = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'netlify-analytics-rollup',
  };

  let sha;
  const existingRes = await fetch(`${apiPath}?ref=${branch}`, { headers });
  if (existingRes.status === 200) {
    const existing = await existingRes.json();
    sha = existing.sha;
  } else if (existingRes.status !== 404) {
    const text = await existingRes.text();
    throw new Error(`Unable to read existing analytics file: ${existingRes.status} ${text}`);
  }

  const payload = {
    message: `Analytics snapshot ${targetDate}`,
    branch,
    content: Buffer.from(content).toString('base64'),
  };
  if (sha) payload.sha = sha;

  const response = await fetch(apiPath, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub commit failed: ${response.status} ${text}`);
  }
}

async function deleteProcessed(store, keys) {
  const batches = [];
  const size = 20;
  for (let i = 0; i < keys.length; i += size) {
    const slice = keys.slice(i, i + size);
    batches.push(Promise.all(slice.map((key) => store.delete(key))));
  }
  await Promise.all(batches);
}

function detectScheduled(event, context) {
  if (context?.scheduledEvent) return true;
  if (context?.executionContext?.type === 'scheduled') return true;
  const headers = event?.headers || {};
  if (headers['x-nf-schedule'] || headers['x-nf-schedule-id'] || headers['x-nf-scheduled']) {
    return true;
  }
  if (headers['x-netlify-event'] === 'scheduler' || headers['x-netlify-event'] === 'schedule') {
    return true;
  }
  return headers['x-nf-request-id']?.startsWith('sched-');
}

export const rollupHandler = async (event, context) => {
  try {
    connectLambda(event);
    const body = parseBody(event);
    const manualToken = adminToken();
    const providedToken = event.queryStringParameters?.token || body?.token;
    const isScheduledInvocation = detectScheduled(event, context);
    console.info('[rollup] invocation start', {
      scheduled: isScheduledInvocation,
      target: event?.queryStringParameters?.date || body?.date || null,
      headers: Object.keys(event?.headers || {}),
      headerValues: {
        'x-netlify-event': event?.headers?.['x-netlify-event'] || null,
        'x-nf-schedule': event?.headers?.['x-nf-schedule'] || null,
        'x-nf-schedule-id': event?.headers?.['x-nf-schedule-id'] || null,
        'x-nf-scheduled': event?.headers?.['x-nf-scheduled'] || null,
        'x-nf-request-id': event?.headers?.['x-nf-request-id'] || null,
        'netlify-agent-category': event?.headers?.['netlify-agent-category'] || null,
      },
    });

    // Manual (non-scheduled) invocations always need a token. Fail closed if
    // ANALYTICS_ADMIN_TOKEN is unset so a misconfigured environment cannot
    // accept anonymous rollup triggers. Scheduled invocations bypass the
    // token check because Netlify already authenticates them.
    if (!isScheduledInvocation) {
      if (!manualToken) {
        console.warn('[rollup] manual trigger refused: ANALYTICS_ADMIN_TOKEN not set');
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Server configuration error: ANALYTICS_ADMIN_TOKEN not set' }),
        };
      }
      if (providedToken !== manualToken) {
        console.warn('[rollup] manual token rejected');
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Unauthorized manual rollup trigger' }),
        };
      }
    }

    const targetDate = getTargetDate(event, body);
    console.info('[rollup] target date resolved', { targetDate });
    const store = getAnalyticsStore();
    const { events, keys } = await fetchEvents(store, targetDate);
    console.info('[rollup] fetched events', { count: events.length, keys: keys.length });

    const runMetadata = {
      runType: isScheduledInvocation ? 'scheduled' : 'manual',
    };
    console.info('[rollup] run metadata', runMetadata);
    const summary = buildSummary(events, targetDate, runMetadata);

    // Fetch previous summaries for 7-day and WoW deltas
    try {
      const last7Dates = Array.from({ length: 7 }, (_, i) => daysAgo(targetDate, i + 1));
      const prevWeekDates = Array.from({ length: 7 }, (_, i) => daysAgo(targetDate, i + 8));

      const [last7Summaries, prevWeekSummaries] = await Promise.all([
        Promise.all(last7Dates.map(fetchGitHubSummary)),
        Promise.all(prevWeekDates.map(fetchGitHubSummary)),
      ]);

      summary.deltas = computeDeltas(summary, last7Summaries, prevWeekSummaries);
      console.info('[rollup] deltas computed', {
        last7Days: summary.deltas.last7Days.daysWithData,
        wowEvents: summary.deltas.weekOverWeek.eventsChange,
      });
    } catch (err) {
      console.warn('[rollup] delta computation failed, skipping', err.message);
    }

    const serialized = JSON.stringify(summary, null, 2);

    await commitToGitHub(serialized, targetDate, runMetadata.runType);
    console.info('[rollup] commit completed', { bytes: serialized.length });

    await deleteProcessed(store, keys);
    console.info('[rollup] deleted processed events', { deleted: keys.length });

    // Check alerting thresholds and send email if breached.
    // Runs after a successful commit so retries don't send duplicate alerts.
    try {
      await checkAndAlert(summary);
    } catch (err) {
      console.warn('[rollup] alerting failed, skipping', err.message);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ date: targetDate, events: events.length }),
    };
  } catch (error) {
    // Netlify can return an opaque 500 "Internal Error" to callers if we throw.
    // Return a safe, actionable error response instead (no secrets).
    const message = error instanceof Error ? error.message : String(error);
    console.error('[rollup] unhandled error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Rollup failed',
        error: message,
      }),
    };
  }
};

export const handler = schedule('0 5 * * *', rollupHandler);

