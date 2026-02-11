import { preflight, withCors } from '../_lib/cors.js';
import { error, json } from '../_lib/response.js';
import { fetchOrderDetails } from '../_services/renewal.js';

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

    const details = await fetchOrderDetails(token);
    return withCors(json(details));
  } catch (err) {
    console.error('GET /orders/details failed', err);
    const status = err.status || 500;
    return withCors(error('order_details_failed', status, { message: err.message }));
  }
}
