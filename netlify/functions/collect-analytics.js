import { createHash, randomUUID } from 'node:crypto';

import { connectLambda, getStore } from '@netlify/blobs';

import { buildCorsHeaders } from './lib/allowed-origins.mjs';

const EVENT_TYPES = new Set(['page_view', 'link_click', 'page_hidden', 'error', 'custom']);
const MAX_BODY_LENGTH = 32 * 1024;
const STORE_NAME = 'analytics-events';

let cachedStore;

function getAnalyticsStore() {
  if (!cachedStore) {
    cachedStore = getStore(STORE_NAME);
  }
  return cachedStore;
}

function buildError(statusCode, message, corsHeaders) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({ message }),
  };
}

function hashIp(ip, salt = '') {
  if (!ip) return null;
  return createHash('sha256').update(`${ip}-${salt}`).digest('hex');
}

function extractClientIp(event, context) {
  return (
    context?.ip ||
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['client-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    ''
  );
}

function normalizeReferrer(referrer = '') {
  if (!referrer) return { full: '', domain: '' };
  try {
    const url = new URL(referrer);
    return { full: referrer, domain: url.hostname };
  } catch {
    return { full: referrer, domain: '' };
  }
}

export const handler = async (event, context) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const corsHeaders = buildCorsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders };
  }

  if (event.httpMethod !== 'POST') {
    return buildError(405, 'Method not allowed', corsHeaders);
  }

  if (event.headers?.dnt === '1') {
    return { statusCode: 204, headers: corsHeaders };
  }

  if (event.body?.length > MAX_BODY_LENGTH) {
    return buildError(413, 'Payload too large', corsHeaders);
  }

  connectLambda(event);

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return buildError(400, 'Invalid JSON body', corsHeaders);
  }

  const { sessionId, eventType, page = {}, visitor = {} } = payload;
  if (!sessionId || !eventType || !page?.url) {
    return buildError(422, 'Missing required fields: sessionId, eventType, page.url', corsHeaders);
  }

  if (!EVENT_TYPES.has(eventType)) {
    return buildError(422, `Unsupported eventType: ${eventType}`, corsHeaders);
  }

  const receivedAt = new Date().toISOString();
  const clientIpHash = hashIp(extractClientIp(event, context), process.env.ANALYTICS_SALT || '');
  const referrer = normalizeReferrer(payload.referrer?.full || payload.referrer);

  const record = {
    ...payload,
    page,
    visitor: {
      ...visitor,
      userAgent: visitor.userAgent || event.headers['user-agent'],
    },
    referrer,
    receivedAt,
    client: {
      ipHash: clientIpHash,
      geo: context?.geo || null,
    },
    server: {
      functionName: context?.functionName || 'collect-analytics',
      deployId: process.env.DEPLOY_ID || null,
    },
  };

  const store = getAnalyticsStore();
  const dayKey = receivedAt.slice(0, 10);
  const blobKey = `queue/${dayKey}/${receivedAt}-${randomUUID()}.json`;

  await store.setJSON(blobKey, record);

  return {
    statusCode: 204,
    headers: corsHeaders,
  };
};
