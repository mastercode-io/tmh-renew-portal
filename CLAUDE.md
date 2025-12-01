# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a trademark renewal portal for The Trademark Helpline. It's a multi-page flow system hosted on Vercel that allows clients to review trademark details, submit renewal orders, and complete payment via Xero invoicing integration.

## Architecture

### Frontend Structure

Static HTML pages with vanilla JavaScript (no build system):

- **`public/renewals/uk/`** - Main UK trademark renewal flow
  - `index.html` - Landing page with trademark details and renewal form
  - `order.html` - Order summary and payment initiation page
  - `confirmation.html` - Post-payment confirmation page
  - `assets/js/main.js` - Landing page logic (prefill, form validation, submission)
  - `assets/js/order.js` - Order page logic (displays summary, initiates payment)
  - `assets/css/styles.css` - Responsive styles using CSS custom properties

### API Layer (Vercel Edge Functions)

All API endpoints run as Edge Functions (standard Web Fetch API, no Node.js built-ins):

- **`api/renewals/details.js`** - `GET /api/renewals/details?token=...`
  - Fetches account, contact, trademark, and upcoming renewals for a token
  - Calls CRM custom function: `renewalgetleadinfo`

- **`api/renewals/order/index.js`** - `POST /api/renewals/order`
  - Creates or updates renewal Deal in CRM from form submission
  - Calls CRM custom function: `renewalcreateorder`
  - Returns order summary with deal_token for subsequent steps

- **`api/renewals/order/[dealId].js`** - `GET /api/renewals/order/:dealId`
  - Fetches latest order summary (line items, VAT, totals) for a Deal
  - Calls CRM custom function: `renewalgetordersummary`

- **`api/renewals/payment-link.js`** - `GET /api/renewals/payment-link?token=...`
  - Requests hosted payment URL from Xero via CRM
  - Calls CRM custom function: `dealcreatepayment`
  - Returns `payment_url` (Xero invoice link) and `deal_token`

- **`api/renewals/payment-status.js`** - `GET /api/renewals/payment-status?token=...`
  - Polls payment status via CRM (which checks Xero)
  - Calls CRM custom function: `renewalgetpaymentstatus`
  - Returns `status` (pending/paid/failed) and `updated_at`

### Service Layer

- **`api/_services/renewal.js`** - Core business logic
  - Wraps all CRM calls with mock data fallback
  - Normalizes CRM responses to consistent payload format
  - Uses `USE_MOCK_DATA` env var to switch between mock/live

- **`api/_lib/crm.js`** - CRM integration helper
  - Builds authenticated requests to Zoho CRM custom functions
  - Appends auth parameters and API key headers
  - Maps endpoint names to Zoho function paths

- **`api/_lib/env.js`** - Environment configuration
  - Reads env vars for CRM base URL, API key, auth type
  - Controls mock data usage

- **`api/_lib/mock-data.js`** - Mock payloads for local development
  - Returns sample responses for all endpoints
  - Allows frontend development without live CRM

### Data Flow

```
User visits link with token
    ↓
GET /api/renewals/details?token=xxx
    ↓ (CRM: renewalgetleadinfo)
Landing page displays account/trademark/form
    ↓
User submits form
    ↓
POST /api/renewals/order (with form data)
    ↓ (CRM: renewalcreateorder)
Order page displays summary (deal_token issued)
    ↓
User clicks "Pay Now"
    ↓
GET /api/renewals/payment-link?token=deal_tok_xxx
    ↓ (CRM: dealcreatepayment → Xero)
Open Xero invoice in new tab, poll status
    ↓
GET /api/renewals/payment-status?token=deal_tok_xxx (polling)
    ↓ (CRM: renewalgetpaymentstatus → Xero)
Detect paid status → redirect to confirmation
```

## Development Workflow

### Local Development

Serve static files directly:

```bash
cd public/renewals/uk
python3 -m http.server 8000
# or
npx serve .
```

Navigate to `http://localhost:8000/` to test the landing page.

### Testing with Mock Data

Set environment variable in Vercel dashboard or `.env` file:

```
USE_MOCK_DATA=true
```

Mock responses are automatically returned from `api/_lib/mock-data.js` when `USE_MOCK_DATA=true` or CRM is not configured.

### Testing with Live CRM

Configure environment variables in Vercel:

```
CRM_API_BASE_URL=https://www.zohoapis.com
CRM_API_KEY=your-api-key
CRM_AUTH_TYPE=apikey
CRM_API_KEY_HEADER=X-API-Key
CRM_API_KEY_PARAM=zapikey
USE_MOCK_DATA=false
```

Ensure the CRM custom functions listed in `api/_lib/crm.js` (CRM_ENDPOINTS) are deployed in Zoho CRM.

### URL Routing

Handled by `vercel.json`:

- `/uk/` → `public/renewals/uk/index.html`
- `/uk/order` → `public/renewals/uk/order.html`
- `/uk/confirmation` → `public/renewals/uk/confirmation.html`
- `/uktm/*` → redirects to `/uk/*` (backwards compatibility)

### Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Or push to Git (auto-deploys if linked to Vercel project).

## Key Frontend Patterns

### Token Handling

All pages use encrypted tokens for security:
- **Request token** (`token`) - validates access to initial renewal details (one-time use)
- **Deal token** (`deal_token`) - identifies order for payment and status polling

Tokens are passed via URL query params and submitted with API requests.

### Prefill Logic

`main.js` fetches data on page load:

```javascript
const token = new URLSearchParams(window.location.search).get('token');
const response = await fetch(`/api/renewals/details?token=${token}`);
const payload = await response.json();
```

Payload structure (see `docs/RENEWAL-PAYLOAD-SPEC.md`):

```javascript
{
  account: { type, name, address, company_number, vat_number },
  contact: { first_name, last_name, email, mobile, phone, position },
  trademark: { id, word_mark, mark_type, jurisdiction, classes, expiry_date, image_url, ... },
  next_due: [ /* array of other trademarks */ ],
  links: { book_call, manage_prefs, terms_conditions }
}
```

### Form Submission Flow

Form submits to `/api/renewals/order`:

```javascript
const formData = {
  token: requestToken,
  contact: { first_name, last_name, email, mobile },
  account: { /* account fields */ },
  trademark_id: selectedTrademarkId,
  changes_requested: { ownership, classification, ... },
  utm_params: { /* tracking data */ }
};

const response = await fetch('/api/renewals/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});

const { deal_token, deal_id, line_items, total } = await response.json();
// Redirect to /uk/order?token=deal_token
```

### Payment Initiation (order.js)

Order page requests payment link:

```javascript
const response = await fetch(`/api/renewals/payment-link?token=${dealToken}`);
const { payment_url, deal_token } = await response.json();

// Open Xero invoice in new tab
window.open(payment_url, '_blank');

// Start polling payment status
pollPaymentStatus(deal_token);
```

### Payment Status Polling (order.js)

Poll every 3 seconds for payment confirmation:

```javascript
async function pollPaymentStatus(token) {
  const response = await fetch(`/api/renewals/payment-status?token=${token}`);
  const { status, updated_at } = await response.json();

  if (status === 'paid') {
    // Redirect to confirmation page
    window.location.href = '/uk/confirmation?token=' + token;
  } else if (status === 'failed') {
    // Show error message
  }
  // Continue polling if pending
}
```

## CRM Integration Requirements

The backend expects these Zoho CRM custom functions to exist (defined in `api/_lib/crm.js`):

1. **renewalgetleadinfo** - Returns account, contact, trademark, next_due for a token
2. **renewalcreateorder** - Creates/updates Deal from form submission
3. **renewalgetordersummary** - Returns Deal line items and totals
4. **dealcreatepayment** - Creates Xero invoice and returns payment URL
5. **renewalgetpaymentstatus** - Checks Xero payment status via CRM

These functions must be deployed in Zoho CRM and accessible via the API key configured in environment variables.

## Important Files

### Configuration
- `vercel.json` - URL routing and redirects
- `api/_lib/env.js` - Environment variable handling
- `api/_lib/crm.js` - CRM endpoint mapping

### Documentation
- `docs/RENEWAL-PAYLOAD-SPEC.md` - Complete API payload specification
- `docs/IMPLEMENTATION-SUMMARY.md` - Implementation details and migration guide
- `docs/API-PHASE-1.md` - Phased implementation roadmap

### Frontend Entry Points
- `public/renewals/uk/index.html` - Landing page
- `public/renewals/uk/assets/js/main.js` - Landing page JavaScript
- `public/renewals/uk/assets/js/order.js` - Order page JavaScript

### API Entry Points
- `api/renewals/details.js` - Prefill endpoint
- `api/renewals/order/index.js` - Order creation endpoint
- `api/renewals/payment-link.js` - Payment initiation endpoint
- `api/renewals/payment-status.js` - Payment polling endpoint

## Design System

CSS uses custom properties defined in `assets/css/styles.css`:

- **Colors**: `--brand-pink`, `--brand-navy`, `--brand-sage`
- **Typography**: Poppins (headings), Nunito Sans (body)
- **Layout tokens**: `--radius`, `--shadow`, `--gap`
- **Responsive breakpoints**: 1100px, 768px, 480px

## Security Notes

- All tokens (request_token, deal_token) are encrypted and validated server-side
- Tokens should be one-time use where applicable
- Never commit `.env` files (already in `.gitignore`)
- CRM API keys must be stored in Vercel environment variables
- Form submissions include UTM tracking - handle per privacy policy

## Common Tasks

### Adding a new API endpoint

1. Create file in `api/renewals/your-endpoint.js`
2. Export Edge runtime config: `export const config = { runtime: 'edge' }`
3. Import service layer: `import { yourFunction } from '../_services/renewal.js'`
4. Add endpoint to `api/_lib/crm.js` (CRM_ENDPOINTS)
5. Add mock response to `api/_lib/mock-data.js`
6. Implement logic in `api/_services/renewal.js`

### Updating the payload structure

1. Update `docs/RENEWAL-PAYLOAD-SPEC.md` with new fields
2. Update mock data in `api/_lib/mock-data.js`
3. Update normalization logic in `api/_services/renewal.js`
4. Update frontend code in `assets/js/main.js` or `assets/js/order.js`
5. Test with mock data before wiring live CRM

### Testing the full flow locally

1. Set `USE_MOCK_DATA=true` in environment
2. Run `vercel dev` (or deploy to Vercel preview)
3. Navigate to `/uk/?token=test123`
4. Submit form → order page → payment flow (uses mock data)
