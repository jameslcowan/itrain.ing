import {
  adminToken,
  isAuthorizedEvent,
  sessionCookieHeader,
} from './lib/analytics-session.mjs';

const LOGIN_PATH = '/.netlify/functions/analytics-login';
const DASHBOARD_PATH = '/.netlify/functions/dashboard';

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loginHtml(error = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Analytics sign in · powerlift.ing</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100dvh;
      display: grid;
      place-items: center;
      margin: 0;
      padding: 1rem;
      background: light-dark(#f5f3ef, #0d0d0f);
      color: light-dark(#1a1a1a, #f5f3ef);
    }
    form {
      width: min(100%, 22rem);
      padding: 1.5rem;
      border: 1px solid light-dark(#ddd, #333);
      border-radius: 12px;
      background: light-dark(#fff, #1a1a1e);
    }
    h1 { font-size: 1.125rem; margin: 0 0 0.25rem; }
    p { margin: 0 0 1.25rem; font-size: 0.875rem; opacity: 0.75; }
    label { display: block; font-size: 0.75rem; margin-bottom: 0.35rem; }
    input {
      width: 100%;
      box-sizing: border-box;
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      border: 1px solid light-dark(#ccc, #444);
      font-size: 1rem;
      margin-bottom: 1rem;
    }
    button {
      width: 100%;
      padding: 0.7rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      background: #c45c26;
      color: #fff;
    }
    .error { color: #dc2626; font-size: 0.8125rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <form method="post" action="${LOGIN_PATH}">
    <h1>powerlift.ing analytics</h1>
    <p>Sign in to view traffic reports.</p>
    ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required />
    <button type="submit">Sign in</button>
  </form>
</body>
</html>`;
}

export const handler = async (event) => {
  const secret = adminToken();
  if (!secret) {
    return { statusCode: 500, body: 'Server configuration error: ANALYTICS_ADMIN_TOKEN not set' };
  }

  if (isAuthorizedEvent(event).ok) {
    return {
      statusCode: 302,
      headers: { Location: DASHBOARD_PATH },
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: loginHtml(),
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return {
      statusCode: 415,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: loginHtml('Unsupported form encoding.'),
    };
  }

  const body = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';
  const password = new URLSearchParams(body).get('password') || '';

  if (password !== secret) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: loginHtml('Incorrect password.'),
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: DASHBOARD_PATH,
      'Set-Cookie': sessionCookieHeader(secret),
    },
  };
};
