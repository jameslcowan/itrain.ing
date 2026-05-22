import { rollupHandler } from './rollup-analytics.js';

// Manual-only endpoint to avoid Netlify schedule wrapper behavior.
// Call: /.netlify/functions/rollup-analytics-manual
export const handler = rollupHandler;


