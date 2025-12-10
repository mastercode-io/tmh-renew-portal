/**
 * Audit Lead Management Endpoint
 * POST /api/audit/lead
 * Handles lead creation and incremental updates for audit flow steps 1-7
 */

import { preflight, withCors } from '../_lib/cors.js';
import { error, json } from '../_lib/response.js';
import { createOrUpdateLead } from '../_services/audit.js';
import ENV from '../_lib/env.js';
import { isCrmConfigured } from '../_lib/crm.js';

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

    if (!body.lead) {
      return withCors(
        error('lead_required', 400, {
          hint: 'Include lead object in request body'
        })
      );
    }

    // Token is optional (omitted on first request)
    const token = body.token || null;
    const result = await createOrUpdateLead(token, body.lead);

    return withCors(json(result, 200));
  } catch (err) {
    console.error('POST /audit/lead failed', err);
    const status = err.status || 500;
    return withCors(
      error('audit_lead_failed', status, {
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
