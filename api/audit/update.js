/**
 * Unified Audit Order Update Endpoint
 * POST /api/audit/update
 * Handles all section updates for audit orders
 */

import { preflight, withCors } from '../_lib/cors.js';
import { error, json } from '../_lib/response.js';
import { createOrUpdateAuditOrder, validateSectionData } from '../_services/audit.js';
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

    // Validate required fields
    if (!body.section) {
      return withCors(
        error('section_required', 400, {
          hint: 'Include section in request body (e.g., "contact", "tmInfo", etc.)'
        })
      );
    }

    if (!body.data) {
      return withCors(
        error('data_required', 400, {
          hint: 'Include data object in request body'
        })
      );
    }

    // Validate orderId requirement for non-contact sections
    if (body.section !== 'contact' && !body.orderId) {
      return withCors(
        error('order_id_required', 400, {
          hint: 'orderId is required for all sections except "contact"'
        })
      );
    }

    // Validate section data
    const validation = validateSectionData(body.section, body.data);
    if (!validation.valid) {
      return withCors(
        error('validation_failed', 400, {
          errors: validation.errors
        })
      );
    }

    // Create or update audit order
    const result = await createOrUpdateAuditOrder(body.orderId, body.section, body.data);

    return withCors(json(result, 200));
  } catch (err) {
    console.error('POST /audit/update failed', err);
    const status = err.status || 500;
    return withCors(
      error('audit_update_failed', status, {
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
