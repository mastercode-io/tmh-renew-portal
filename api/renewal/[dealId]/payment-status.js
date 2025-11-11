import { preflight, withCors } from '../../_lib/cors.js';
import { error, json } from '../../_lib/response.js';
import { fetchPaymentStatus } from '../../_services/renewal.js';

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

    const status = await fetchPaymentStatus(dealToken);
    return withCors(json(status));
  } catch (err) {
    console.error('GET /renewal/:dealToken/payment-status failed', err);
    const status = err.status || 500;
    return withCors(error('payment_status_failed', status, { message: err.message }));
  }
}

function extractDealToken(url) {
  try {
    const parsedUrl = new URL(url);
    const tokenParam = parsedUrl.searchParams.get('token');
    if (tokenParam) return tokenParam;

    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    return segments[segments.length - 2] || null;
  } catch (err) {
    return null;
  }
}
