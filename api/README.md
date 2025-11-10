Renewal Edge API
----------------

The `/api/renewal/*` endpoints are implemented as Vercel Edge Functions that proxy
the Renewal Portal to Zoho CRM custom APIs and Xero. They return the payload
shapes defined in `docs/RENEWAL-PAYLOAD-SPEC.md`.

### Runtime

- Edge runtime (`export const config = { runtime: 'edge' }`)
- Standard Web Fetch API (no Node.js built-ins)
- Optional mock responses for local development (`USE_MOCK_DATA=true`)

### Endpoints

| Method | Route | Description | CRM/Xero integration |
|--------|-------|-------------|----------------------|
| `GET` | `/api/renewal/details?token=tok_123` | Returns account, contact, trademark, and upcoming renewals for the token. | `CRM_REQUIRED_APIS.RenewalDetails` |
| `POST` | `/api/renewal/order` | Converts the renewal submission into CRM entities and responds with the order summary (includes `deal_token`). | `CRM_REQUIRED_APIS.RenewalOrder` |
| `GET` | `/api/renewal/order/:dealId` | Fetches latest order summary (line items, VAT, totals) for the Deal. | `CRM_REQUIRED_APIS.RenewalOrderSummary` |
| `GET` | `/api/renewal/payment-link?token=deal_tok_123` | Requests a hosted payment URL using the encrypted deal token from order response; returns `payment_url`, `invoice_id`, and `deal_token`. | `CRM_REQUIRED_APIS.XeroPaymentLink` |
| `GET` | `/api/renewal/:dealId/payment-status` | Polls for payment status via the CRM custom API (which checks Xero). | `CRM_REQUIRED_APIS.XeroPaymentStatus` |

See `api/_lib/crm.js` for the list placeholders that must be wired to the actual
custom API endpoints.

### Environment variables

```
CRM_API_BASE_URL=https://www.zohoapis.com
CRM_API_KEY=super-secret-key
CRM_AUTH_TYPE=apikey
CRM_API_KEY_HEADER=X-API-Key
CRM_API_KEY_PARAM=zapikey
USE_MOCK_DATA=true
```

Set `USE_MOCK_DATA=false` to force real CRM calls. When unset or `true`,
mock payloads from `api/_lib/mock-data.js` are returned so the landing page can
be exercised without live integrations.

The CRM helper automatically appends `auth_type` and the API key as query
parameters and sends the API key header. Adjust the function names or
environment variables if your custom endpoints differ from the defaults in
`api/_lib/crm.js`.

### Local smoke test

```
node --input-type=module -e "import('./api/_services/renewal.js').then(async m => {
  const details = await m.fetchRenewalDetails('token-mock');
  console.log(details.account.type, details.trademark.word_mark);
})"
```

### Deployment (Vercel)

1. Configure the environment variables above in the Vercel project.
2. Ensure the CRM custom APIs (see `CRM_REQUIRED_APIS`) are deployed and whitelisted for the API key.
3. Update `CRM_ENDPOINTS` if your custom Zoho function names differ.
4. Push the repository (Edge handlers live under `api/renewal`).
5. Deploy via `vercel --prod` or Git integration.
6. Test the endpoints (e.g. `GET https://<domain>/api/renewal/details?token=...`).
