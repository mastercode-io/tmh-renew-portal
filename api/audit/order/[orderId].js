/**
 * Get Audit Order Endpoint
 * GET /api/audit/order/:orderId
 * Fetches complete audit order data for summary/confirmation display
 */

import { preflight, withCors } from '../../_lib/cors.js';
import { error, json } from '../../_lib/response.js';
import { fetchAuditOrder } from '../../_services/audit.js';
import ENV from '../../_lib/env.js';
import { isCrmConfigured } from '../../_lib/crm.js';

export const config = { runtime: 'edge' };

export default async function handler(request, context) {
  if (request.method === 'OPTIONS') {
    return preflight();
  }

  if (request.method !== 'GET') {
    return withCors(
      error('method_not_allowed', 405, {
        received_method: request.method,
        allowed_methods: ['GET'],
        url: request.url
      })
    );
  }

  try {
    const orderId = context.params?.orderId;

    if (!orderId) {
      return withCors(
        error('order_id_required', 400, {
          hint: 'Include orderId in URL path'
        })
      );
    }

    const order = await fetchAuditOrder(orderId);
    return withCors(json(order, 200));
  } catch (err) {
    console.error('GET /audit/order/:orderId failed', err);
    const status = err.status || 500;
    return withCors(
      error('audit_order_fetch_failed', status, {
        message: err.message,
        crm_configured: isCrmConfigured(),
        use_mock_data: ENV.useMockData,
        details: err.details
      })
    );
  }
}
