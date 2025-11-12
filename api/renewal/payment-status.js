import { preflight, withCors } from '../_lib/cors.js';
import { error, json } from '../_lib/response.js';
import { fetchPaymentStatus } from '../_services/renewal.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return preflight();
  }

  if (request.method !== 'GET') {
    return withCors(error('method_not_allowed', 405));
  }

  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return withCors(error('token_required', 400));
    }

    const status = await fetchPaymentStatus(token);
    return withCors(json(status));
  } catch (err) {
    console.error('GET /renewal/payment-status failed', err);
    const status = err.status || 500;
    return withCors(error('payment_status_failed', status, { message: err.message }));
  }
}
