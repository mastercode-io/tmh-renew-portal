Serverless API (example stubs)
------------------------------

These are reference examples for the endpoints the landing page calls.
Adapt to your hosting (Vercel/Netlify/Azure Functions/Lambda/etc.).

- `GET /api/prefill?request_id=...` → validates the one-time `request_id` and returns CRM data for prefill.
- `POST /api/lead` → receives the form payload and stores/updates the lead in CRM.

Both examples below are Node/Express-style handlers to convert to your platform.

