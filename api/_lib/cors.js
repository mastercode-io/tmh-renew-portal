const ALLOWED_METHODS = 'GET,POST,OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization';
const EXPOSED_HEADERS = 'Content-Type';

export function preflight(origin = '*') {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(origin)
  });
}

export function withCors(response, origin = '*') {
  const headers = new Headers(response.headers);
  const cors = buildCorsHeaders(origin);
  Object.entries(cors).forEach(([key, value]) => headers.set(key, value));

  return new Response(response.body, {
    status: response.status,
    headers
  });
}

function buildCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'Access-Control-Expose-Headers': EXPOSED_HEADERS,
    'Access-Control-Max-Age': '86400'
  };
}
