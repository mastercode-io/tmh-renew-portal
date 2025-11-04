export function json(data, status = 200, init = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
    ...init
  });
}

export function error(message, status = 400, meta = {}) {
  return json({ error: message, ...meta }, status);
}
