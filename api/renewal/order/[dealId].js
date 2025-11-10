import { preflight, withCors } from '../../_lib/cors.js';
import { error, json } from '../../_lib/response.js';
import { fetchRenewalOrderSummary } from '../../_services/renewal.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return preflight();
  }

  if (request.method !== 'GET') {
    return withCors(error('method_not_allowed', 405));
  }

  try {
    const dealToken = extractDealToken(request.url);
    if (!dealToken) {
      return withCors(error('deal_token_required', 400));
    }

    const summary = await fetchRenewalOrderSummary(dealToken);
    return withCors(json(summary));
  } catch (err) {
    console.error('GET /renewal/order/:dealToken failed', err);
    const status = err.status || 500;
    return withCors(error('renewal_order_summary_failed', status, { message: err.message }));
  }
}

function extractDealToken(url) {
  try {
    const { pathname } = new URL(url);
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || null;
  } catch (err) {
    return null;
  }
}
