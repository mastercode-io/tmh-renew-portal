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
    const dealId = extractDealId(request.url);
    if (!dealId) {
      return withCors(error('deal_id_required', 400));
    }

    const status = await fetchPaymentStatus(dealId);
    return withCors(json(status));
  } catch (err) {
    console.error('GET /renewal/:dealId/payment-status failed', err);
    const status = err.status || 500;
    return withCors(error('payment_status_failed', status, { message: err.message }));
  }
}

function extractDealId(url) {
  try {
    const { pathname } = new URL(url);
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 2] || null;
  } catch (err) {
    return null;
  }
}
