/**
 * Trigger the rollup analytics Netlify Function on demand.
 *
 * Usage:
 *   ANALYTICS_ADMIN_TOKEN=xxxx ROLLUP_SITE_URL=https://powerlift.ing npm run rollup:trigger
 *   npm run rollup:trigger -- 2026-05-20
 */

const siteUrl = process.env.ROLLUP_SITE_URL;
const manualToken = process.env.ANALYTICS_ADMIN_TOKEN || process.env.MANUAL_ROLLUP_TOKEN;
const functionName = process.env.ROLLUP_FUNCTION_NAME || 'rollup-analytics-manual';

if (!siteUrl) {
  console.error('Missing ROLLUP_SITE_URL. Set it to your deployed Netlify domain.');
  process.exit(1);
}

if (!manualToken) {
  console.error('Missing ANALYTICS_ADMIN_TOKEN.');
  process.exit(1);
}

const CLI_DATE = process.argv[2];
const defaultDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const targetDate = CLI_DATE || defaultDate;

const endpoint = `${siteUrl.replace(/\/$/, '')}/.netlify/functions/${functionName}`;

console.log(`Triggering rollup for ${targetDate} via ${endpoint}...`);

try {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: targetDate, token: manualToken }),
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`Rollup failed (${response.status}): ${text}`);
    process.exit(1);
  }

  console.log(`Rollup succeeded: ${text}`);
} catch (error) {
  console.error('Failed to trigger rollup:', error);
  process.exit(1);
}
