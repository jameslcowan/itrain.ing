import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'pl_analytics_session';

export function adminToken() {
  return process.env.ANALYTICS_ADMIN_TOKEN || process.env.MANUAL_ROLLUP_TOKEN || '';
}

export function sessionValue(secret) {
  if (!secret) return null;
  return createHmac('sha256', secret).update('powerlift-analytics-v1').digest('hex');
}

export function isValidSession(cookieValue, secret) {
  const expected = sessionValue(secret);
  if (!cookieValue || !expected) return false;
  try {
    const a = Buffer.from(cookieValue);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(rest.join('='));
  }
  return out;
}

export function isAuthorizedEvent(event) {
  const secret = adminToken();
  if (!secret) return { ok: false, reason: 'missing_secret' };

  const qs = event.queryStringParameters || {};
  if (qs.token === secret) return { ok: true };

  const cookieHeader = event.headers?.cookie || event.headers?.Cookie || '';
  const cookies = parseCookies(cookieHeader);
  if (isValidSession(cookies[SESSION_COOKIE], secret)) return { ok: true };

  return { ok: false };
}

export function sessionCookieHeader(secret, maxAgeSec = 60 * 60 * 24 * 30) {
  const value = sessionValue(secret);
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}
