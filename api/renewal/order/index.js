import { preflight, withCors } from '../../_lib/cors.js';
import { error, json } from '../../_lib/response.js';
import { submitRenewalOrder } from '../../_services/renewal.js';
import ENV from '../../_lib/env.js';
import { isCrmConfigured } from '../../_lib/crm.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return preflight();
  }

  if (request.method !== 'POST') {
    return withCors(
      error('method_not_allowed', 405, {
        received_method: request.method,
        allowed_methods: ['POST'],
        url: request.url
      })
    );
  }

  try {
    const body = await safeJson(request);
    if (!body) {
      return withCors(
        error('invalid_json', 400, {
          hint: 'Ensure request has a JSON body and Content-Type: application/json'
        })
      );
    }

    if (!body.token) {
      return withCors(
        error('token_required', 400, {
          hint: 'Include token in request body'
        })
      );
    }

    const summary = await submitRenewalOrder(body);
    return withCors(json(summary, 200));
  } catch (err) {
    console.error('POST /renewal/order failed', err);
    const status = err.status || 500;
    return withCors(
      error('renewal_order_failed', status, {
        message: err.message,
        crm_configured: isCrmConfigured(),
        use_mock_data: ENV.useMockData,
        details: err.details
      })
    );
  }
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch (err) {
    return null;
  }
}
