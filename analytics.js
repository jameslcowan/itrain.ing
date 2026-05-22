const ANALYTICS_ENDPOINT = '/.netlify/functions/collect-analytics';
const SESSION_ID = crypto.randomUUID();
const VISITOR_KEY = 'pl-analytics-visitor';
const SITE_ID = 'powerlift.ing';

const STORAGE_AVAILABLE = (() => {
  try {
    const testKey = '__pl_analytics_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
})();

const performanceState = {
  lcp: null,
  fid: null,
};

/** Collapse shared-program URLs so analytics never store full encoded state. */
function analyticsPath() {
  const path = window.location.pathname;
  if (path === '/app' || path.startsWith('/app/')) return '/app';
  if (path.startsWith('/program/') || path.startsWith('/p/')) return '/app';
  return path;
}

function analyticsUrl() {
  const path = analyticsPath();
  return `${window.location.origin}${path}${window.location.search}`;
}

function getOrCreateVisitorGuid() {
  if (!STORAGE_AVAILABLE) return crypto.randomUUID();
  let guid = window.localStorage.getItem(VISITOR_KEY);
  if (!guid) {
    guid = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, guid);
  }
  return guid;
}

async function hashVisitorGuid(guid, userAgent) {
  if (!crypto?.subtle) return `${guid}-${userAgent}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(`${guid}-${userAgent || ''}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function collectUTMParams() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) => {
    if (params.has(key)) utm[key] = params.get(key);
  });
  return utm;
}

function getDeviceType() {
  const width = window.innerWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

function getNavigationTimings() {
  const navigationEntries = performance.getEntriesByType?.('navigation');
  if (!navigationEntries?.length) return {};
  const nav = navigationEntries[0];
  return {
    ttfb: nav.responseStart ?? null,
    domContentLoaded: nav.domContentLoadedEventEnd ?? null,
    load: nav.loadEventEnd ?? null,
    renderTime: nav.domComplete ?? null,
    transferSize: nav.transferSize ?? null,
  };
}

function initPerformanceObservers() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const lastEntry = entryList.getEntries().at(-1);
      if (lastEntry) {
        performanceState.lcp = lastEntry.renderTime || lastEntry.loadTime || null;
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // unsupported
  }

  try {
    const fidObserver = new PerformanceObserver((entryList) => {
      const first = entryList.getEntries()[0];
      if (first) {
        performanceState.fid = first.processingStart - first.startTime;
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    // unsupported
  }
}

async function buildPayload(eventType = 'page_view', overrides = {}) {
  const userAgent = navigator.userAgent;
  const hashedVisitor = await hashVisitorGuid(getOrCreateVisitorGuid(), userAgent);
  const path = analyticsPath();
  const payload = {
    site: SITE_ID,
    sessionId: SESSION_ID,
    eventType,
    timestamp: new Date().toISOString(),
    page: {
      url: analyticsUrl(),
      path,
      title: document.title,
      language: document.documentElement.lang || navigator.language,
    },
    referrer: {
      full: document.referrer || '',
      domain: document.referrer
        ? (() => {
            try {
              return new URL(document.referrer).hostname;
            } catch {
              return '';
            }
          })()
        : '',
      utm: collectUTMParams(),
    },
    visitor: {
      id: hashedVisitor,
      userAgent,
      deviceType: getDeviceType(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferredColorScheme: window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light',
    },
    performance: {
      ...getNavigationTimings(),
      lcp: performanceState.lcp,
      fid: performanceState.fid,
    },
    eventMeta: {},
  };

  return {
    ...payload,
    ...overrides,
    eventMeta: {
      ...payload.eventMeta,
      ...(overrides.eventMeta || {}),
    },
  };
}

function sendAnalytics(payload) {
  const body = JSON.stringify(payload);
  const beaconBlob = new Blob([body], { type: 'application/json' });

  if (navigator.sendBeacon?.(ANALYTICS_ENDPOINT, beaconBlob)) {
    return;
  }

  fetch(ANALYTICS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body,
  }).catch(() => {});
}

function track(eventType, overrides = {}) {
  buildPayload(eventType, overrides)
    .then(sendAnalytics)
    .catch(() => {});
}

function registerEventListeners() {
  window.addEventListener('load', () => {
    track('page_view');
  });

  document.addEventListener('click', (event) => {
    const anchor = event.target?.closest?.('a');
    if (!anchor) return;
    track('link_click', {
      eventMeta: {
        linkHref: anchor.href,
        linkText: anchor.textContent?.trim() || '',
        linkTarget: anchor.getAttribute('target') || '_self',
      },
    });
  });
}

initPerformanceObservers();
registerEventListeners();
