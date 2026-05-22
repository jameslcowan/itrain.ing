export const STATIC_ORIGINS = new Set([
  'https://powerlift.ing',
  'https://www.powerlift.ing',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:8888',
  'http://127.0.0.1:8888',
]);

export const DYNAMIC_ORIGIN_RES = [
  /^https:\/\/[a-z0-9-]+--powerlift-ing\.netlify\.app$/,
  /^https:\/\/deploy-preview-\d+--powerlift-ing\.netlify\.app$/,
];

export function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (STATIC_ORIGINS.has(origin)) return true;
  return DYNAMIC_ORIGIN_RES.some((re) => re.test(origin));
}

export function buildCorsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    Vary: 'Origin',
  };
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}
