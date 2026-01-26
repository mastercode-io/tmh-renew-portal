/**
 * Temmy Search Proxy (Edge)
 * POST /api/temmy/search
 * Accepts either { text } for keyword search or { application_number } for direct lookup
 */

import { preflight, withCors } from '../_lib/cors.js';
import { error, json } from '../_lib/response.js';
import ENV from '../_lib/env.js';
import { getMockTemmyDetails, getMockTemmySearch } from '../_lib/mock-data.js';

export const config = { runtime: 'edge' };

const TEMMY_SEARCH_URL = 'https://temmy-api-zfxujusd3q-nw.a.run.app/api/v1/trademarks/search';
const TEMMY_DETAILS_URL = 'https://temmy-api-zfxujusd3q-nw.a.run.app/api/v1/trademarks/';

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

    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const applicationNumberRaw = body.application_number || body.applicationNumber;
    const applicationNumber = typeof applicationNumberRaw === 'string' ? applicationNumberRaw.trim() : '';

    if (!text && !applicationNumber) {
      return withCors(
        error('search_term_required', 400, {
          hint: 'Provide either text or application_number'
        })
      );
    }

    if (ENV.useMockData) {
      const data = applicationNumber
        ? getMockTemmyDetails(applicationNumber)
        : getMockTemmySearch(text);
      return withCors(
        json(
          {
            source: 'mock',
            data
          },
          200
        )
      );
    }

    if (!ENV.temmyApiKey || !ENV.temmyApiKeyHeader) {
      return withCors(
        error('temmy_api_not_configured', 500, {
          hint: 'TEMMY_API_KEY and TEMMY_API_KEY_HEADER must be set'
        })
      );
    }

    const targetUrl = applicationNumber
      ? `${TEMMY_DETAILS_URL}${encodeURIComponent(applicationNumber)}`
      : `${TEMMY_SEARCH_URL}?text=${encodeURIComponent(text)}`;

    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        [ENV.temmyApiKeyHeader]: ENV.temmyApiKey
      }
    });

    const responseText = await upstreamResponse.text();
    const parsed = safeParseJson(responseText);

    if (!upstreamResponse.ok) {
      return withCors(
        error('temmy_search_failed', upstreamResponse.status, {
          status: upstreamResponse.status,
          statusText: upstreamResponse.statusText,
          body: parsed || responseText
        })
      );
    }

    return withCors(
      json(
        {
          source: 'live',
          data: parsed ?? responseText
        },
        upstreamResponse.status
      )
    );
  } catch (err) {
    console.error('POST /api/temmy/search failed', err);
    return withCors(
      error('temmy_search_error', 500, {
        message: err.message
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

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}
