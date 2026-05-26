/**
 * Multisite analytics beacon — PostgREST RPCs on api.panax.ai
 * Enable per site after privacy policy update.
 *
 * <script src="/path/to/analytics.js" defer
 *   data-site-id="powerlift"
 *   data-api-base="https://api.panax.ai"></script>
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var siteId = script.getAttribute('data-site-id');
  var apiBase = (script.getAttribute('data-api-base') || 'https://api.panax.ai').replace(/\/$/, '');
  if (!siteId) {
    console.warn('[analytics] missing data-site-id');
    return;
  }

  var VISITOR_KEY = 'itrain_visitor_id';
  var SESSION_KEY = 'itrain_session_' + siteId;

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getVisitorId() {
    try {
      var v = localStorage.getItem(VISITOR_KEY);
      if (v) return v;
      v = uuid();
      localStorage.setItem(VISITOR_KEY, v);
      return v;
    } catch (e) {
      return uuid();
    }
  }

  function getSessionId() {
    try {
      return sessionStorage.getItem(SESSION_KEY);
    } catch (e) {
      return null;
    }
  }

  function setSessionId(id) {
    try {
      sessionStorage.setItem(SESSION_KEY, id);
    } catch (e) { /* ignore */ }
  }

  function rpc(name, body) {
    return fetch(apiBase + '/rpc/' + name, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  }

  function parseUtm() {
    var q = new URLSearchParams(location.search);
    return {
      p_utm_source: q.get('utm_source'),
      p_utm_medium: q.get('utm_medium'),
      p_utm_campaign: q.get('utm_campaign'),
      p_utm_term: q.get('utm_term'),
      p_utm_content: q.get('utm_content'),
    };
  }

  function navTiming() {
    var n = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (!n) return {};
    return {
      p_load_time_ms: n.loadEventEnd ? Math.round(n.loadEventEnd - n.startTime) : null,
      p_dom_ready_ms: n.domContentLoadedEventEnd
        ? Math.round(n.domContentLoadedEventEnd - n.startTime)
        : null,
    };
  }

  function connectionType() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return c && c.effectiveType ? c.effectiveType : null;
  }

  function startSession() {
    var utm = parseUtm();
    var body = Object.assign(
      {
        p_site_id: siteId,
        p_visitor_id: getVisitorId(),
        p_ua_raw: navigator.userAgent,
        p_referrer_url: document.referrer || null,
        p_entry_path: location.pathname,
        p_language: navigator.language || null,
        p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      },
      utm
    );
    return rpc('start_session', body).then(function (res) {
      if (!res.ok) throw new Error('start_session ' + res.status);
      return res.json();
    });
  }

  function clientOccurredAt() {
    return new Date().toISOString();
  }

  function recordPageView(sessionId, opts) {
    var body = Object.assign(
      {
        p_site_id: siteId,
        p_session_id: sessionId,
        p_occurred_at: clientOccurredAt(),
        p_path: location.pathname,
        p_referrer_url: document.referrer || null,
        p_full_url: location.href,
        p_query_string: location.search || null,
        p_document_title: document.title || null,
        p_viewport_w: window.innerWidth,
        p_viewport_h: window.innerHeight,
        p_screen_w: screen.width,
        p_screen_h: screen.height,
        p_device_pixel_ratio: window.devicePixelRatio,
        p_connection_type: connectionType(),
      },
      navTiming(),
      opts || {}
    );
    return rpc('record_page_view', body);
  }

  function ensureSession() {
    var existing = getSessionId();
    if (existing) {
      return Promise.resolve({ sessionId: existing, isEntry: false });
    }
    return startSession().then(function (data) {
      setSessionId(data.session_id);
      return { sessionId: data.session_id, isEntry: true };
    });
  }

  function onLoad() {
    ensureSession()
      .then(function (session) {
        return recordPageView(session.sessionId, { p_is_entry: session.isEntry });
      })
      .catch(function () { /* silent */ });
  }

  function onUnload() {
    var sid = getSessionId();
    if (!sid) return;
    var payload = {
      p_site_id: siteId,
      p_session_id: sid,
      p_occurred_at: clientOccurredAt(),
      p_path: location.pathname,
      p_is_exit: true,
      p_duration_ms: null,
      p_scroll_depth_pct: null,
    };
    rpc('record_page_view', payload).catch(function () {});
  }

  window.itrainAnalytics = {
    track: function (eventType, extra) {
      return ensureSession().then(function (session) {
        return rpc(
          'record_custom_event',
          Object.assign(
            {
              p_site_id: siteId,
              p_session_id: session.sessionId,
              p_event_type: eventType,
              p_occurred_at: clientOccurredAt(),
              p_path: location.pathname,
            },
            extra || {}
          )
        );
      });
    },
  };

  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad);
  window.addEventListener('pagehide', onUnload);
})();
