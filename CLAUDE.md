# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client portal for The Trademark Helpline with two main flows:

1. **Trademark Renewals** (`/renewals/uk/`) - Token-based flow for existing clients to renew trademarks
2. **Trademark Audits** (`/audit/`) - Public multi-step wizard for new audit requests

Both flows are hosted on Vercel, use vanilla JavaScript (no build system), and integrate with Zoho CRM and Xero for payment processing.

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

- `/renewals/uk/` → `public/renewals/uk/index.html` (direct access)
- `/renewals/uk/order` → `public/renewals/uk/order.html`
- `/renewals/uk/confirmation` → `public/renewals/uk/confirmation.html`
- `/uktm/*` → redirects to `/renewals/uk/*` (backwards compatibility)

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
// Redirect to /renewals/uk/order?token=deal_token
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
    window.location.href = '/renewals/uk/confirmation?token=' + token;
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

---

# Trademark Audit Flow

## Overview

The Audit flow (`/audit/`) is a public-facing 6-step wizard that collects trademark audit requests from potential clients. Unlike renewals which are token-gated, audits start with a contact form and build up a Lead record incrementally through the wizard steps.

## Pages

- **`/audit/`** - Multi-step wizard (Steps 1-6)
- **`/audit/summary/`** - Order review and payment initiation
- **`/audit/confirmation/`** - Post-payment confirmation

## Audit Data Flow

```
User visits /audit/
    ↓
Step 1: Contact Info → POST /api/audit/lead (no token)
    ↓ CRM: Creates Lead, returns token
    ↓
Step 2: Preferences → POST /api/audit/lead (with token)
    ↓ CRM: Updates Lead
    ↓
Step 3: Trademark Status
    ├─ If Existing:
    │     ↓ POST /api/temmy/search (Temmy API)
    │     ↓ User selects trademark from results
    └─ If New:
          ↓ Collects application details (type, name, jurisdictions)
    ↓ POST /api/audit/lead (with token)
    ↓
Step 4: Goods/Services → POST /api/audit/lead (with token)
    ↓
Step 5: Billing → POST /api/audit/lead (with token)
    ↓ Redirect to /audit/summary/?orderId=xxx
    ↓
GET /api/audit/order/:orderId (load order summary)
    ↓
User reviews order, selects social addon, accepts terms
    ↓
POST /api/audit/update (section: paymentOptions)
    ↓ CRM: Creates Xero invoice, returns checkoutUrl
    ↓
Redirect to Xero payment page
    ↓
**[NOT IMPLEMENTED]** Poll payment status
    ↓
**[NOT IMPLEMENTED]** Redirect to /audit/confirmation/
```

## Wizard Steps (Detail)

### Step 1: Contact Information
- **Fields**: First Name, Last Name, Email, Phone (all required)
- **API**: `POST /api/audit/lead` (no token)
- **Response**: `{ token, lead }` - token used for Steps 2-5
- **State**: Stored in localStorage `sections.contact`
- **SalesIQ**: Visitor initialized with contact details after submission

### Step 2: Contact Preferences
- **Fields**: Preferred contact methods (checkboxes)
  - Phone, SMS, WhatsApp, Email, Video Call (Teams)
  - At least one required
- **API**: `POST /api/audit/lead` (with token from Step 1)
- **State**: `sections.preferences.methods[]`
- **UI**: Progress indicators (1-6) appear starting from Step 2

### Step 3: Trademark Status & Details (Combined)
This is the most complex step with two different flows:

#### **Option A: Existing Trademark**
- **Search Fields**:
  - Trademark Name (text) OR
  - Application Number (text)
  - If both provided, application number takes precedence

- **Search Button**: "Search on Temmy"
  - Calls `POST /api/temmy/search` with `{ text }` or `{ application_number }`
  - Live API: `https://temmy-api-zfxujusd3q-nw.a.run.app/api/v1/trademarks/`

- **Results Display**:
  - **Single Result**: Auto-selected, shows detail card immediately
  - **Multiple Results**: Table with:
    - Application Number (clickable to expand/collapse)
    - Trademark Name
    - Applicant Name
    - Status
    - Select (checkbox - required)
  - **Expand/Collapse**:
    - Click app number or ➕/➖ to toggle details
    - "Expand all" / "Collapse all" buttons
    - Details fetched on first expand via `POST /api/temmy/search { application_number }`
    - Shows: Application Date, Expiry Date, Classes, Mark Type

- **State**: `sections.temmy`
  - `results.items[]` - Search results
  - `details[appNumber]` - Cached detail data
  - `expanded[appNumber]` - Expanded state
  - `selected` - Selected application number (required if multiple results)

#### **Option B: New Trademark Application**
- **Fields**:
  - **Type** (radio, required): Word, Image, Both
  - **Name** (text, required)
  - **Image Upload** (radio):
    - "Yes – Upload" → shows file upload field
    - "I will do this later or share via email"
  - **Jurisdictions** (checkboxes, at least one required):
    - Europe, Rest of Countries, United Kingdom, United States of America
    - If "Rest of Countries" selected → text field for custom jurisdiction

- **State**: `sections.tmInfo`

**Note**: Both flows update the same Lead via `POST /api/audit/lead`

### Step 4: Goods & Services
- **Fields** (both optional):
  - Business description (textarea)
  - Website URL
- **API**: `POST /api/audit/lead` (with token)
- **State**: `sections.goods`

### Step 5: Billing Information
- **Fields**:
  - Billing Type (radio): Individual / Organisation
    - If Individual: First Name, Last Name
    - If Organisation: Company Name
  - Address: Line 1, Line 2*, City, County*, Postcode, Country
  - Invoice Email (required)
  - Invoice Phone (required)
  - *Optional fields

- **Pre-fill**: Name and contact fields auto-filled from Step 1
- **API**: `POST /api/audit/lead` (with token)
- **State**: `sections.billing`
- **Button**: "Review My Order" → redirects to `/audit/summary/?orderId=xxx`

### Summary Page
- **Load**: `GET /api/audit/order/:orderId`
- **Displays**:
  - Contact Information (name, email, phone, preferred methods)
  - Trademark Information (status, name, type, jurisdictions, description, website)
  - Billing Information (type, name, address, invoice email/phone)

- **Social Media Addon** (checkbox):
  - "Add Social Media Searches for only £10"
  - Searches: Facebook, Instagram, YouTube, TikTok, LinkedIn

- **Pricing**:
  ```
  Base Trademark Audit:     £99.00
  Social Media Audit:       £10.00 (if selected)
  Online Audit Discount:   -£40.00
  ─────────────────────────────────
  Net Fees:                 £69.00 (or £59.00)
  VAT (20%):                £13.80 (or £11.80)
  ─────────────────────────────────
  Total:                    £82.80 (or £70.80)
  ```

- **Terms & Conditions** (checkbox, required)

- **Payment**:
  - "Pay Now" button
  - Validates terms acceptance
  - `POST /api/audit/update` with `{ orderId, section: "paymentOptions", data: { socialMediaAddon, termsAccepted } }`
  - **Expected**: Returns `{ checkoutUrl }` → redirect to Xero
  - **Current**: Returns mock data, payment flow incomplete

### Confirmation Page
- Displays success message
- Shows order reference and date
- Clears localStorage state (`audit_order_state`)
- "Return to Homepage" button

## Audit API Endpoints

### 1. `POST /api/audit/lead`
**Purpose**: Create or update Lead incrementally (Steps 1-5)

**Request** (Step 1 - no token):
```json
{
  "lead": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+44123456789"
  }
}
```

**Request** (Steps 2-5 - with token):
```json
{
  "token": "abc123...",
  "lead": {
    "preferred_methods_of_contact": ["Phone", "Email"]
  }
}
```

**Response**:
```json
{
  "token": "abc123...",
  "lead": { /* full lead object */ }
}
```

**Field Mappings** (per step):
- **Step 1 (contact)**: `first_name`, `last_name`, `email`, `phone`
- **Step 2 (preferences)**: `preferred_methods_of_contact[]`
- **Step 3 (tmStatus)**:
  - `trademark_status` ("existing" | "new")
  - If existing: `trademark_name`, `trademark_application_number`
  - If new: `trademark_types`, `trademark_name`, `trademark_jurisdictions[]`, `trademark_other_jurisdiction`, `trademark_image_choice`, `trademark_image_file`
- **Step 4 (goods)**: `goods_description`, `website`
- **Step 5 (billing)**: `billing_type`, `billing_first_name`/`billing_last_name` OR `billing_company_name`, `billing_address{}`, `billing_invoice_email`, `billing_invoice_phone`

**CRM Function**: `auditCreateLead` (defined in `CRM_ENDPOINTS`)

### 2. `POST /api/temmy/search`
**Purpose**: Search Temmy trademark database

**Request** (text search):
```json
{
  "text": "TECHIFY"
}
```

**Request** (direct lookup):
```json
{
  "application_number": "UK00003456789"
}
```

**Response**:
```json
{
  "source": "live" | "mock",
  "data": {
    "items": [
      {
        "application_number": "UK00003456789",
        "verbal_element_text": "TECHIFY",
        "status": "Registered",
        "applicants": [{ "name": "Tech Company Ltd" }],
        "mark": { "feature": "Word" },
        "classes": [9, 42],
        "application_date_time": "2020-01-15T00:00:00Z",
        "expiry_date": "2030-01-15"
      }
    ]
  }
}
```

**Live API**: `https://temmy-api-zfxujusd3q-nw.a.run.app/api/v1/trademarks/`
- `/search?text=xxx` for text search
- `/:application_number` for direct lookup

**Environment Variables**:
- `TEMMY_API_KEY` - API key for Temmy
- `TEMMY_API_KEY_HEADER` - Header name for API key
- `USE_MOCK_DATA` - Fallback to mock data

### 3. `POST /api/audit/update`
**Purpose**: Update order sections (currently only paymentOptions)

**Request**:
```json
{
  "orderId": "xxx",
  "section": "paymentOptions",
  "data": {
    "socialMediaAddon": true,
    "termsAccepted": true
  }
}
```

**Response**:
```json
{
  "orderId": "xxx",
  "success": true,
  "checkoutUrl": "https://xero-payment-link"
}
```

**CRM Function**: `auditUpdate` (defined in `CRM_ENDPOINTS`)
**Status**: ❌ Returns mock data, Xero integration not implemented

### 4. `GET /api/audit/order/:orderId`
**Purpose**: Fetch complete order summary

**Response**:
```json
{
  "orderId": "xxx",
  "dealId": "12345",
  "sections": {
    "contact": { "firstName": "John", "lastName": "Doe", ... },
    "preferences": { "methods": ["Phone", "Email"] },
    "tmStatus": { "status": "existing" },
    "tmInfo": { "types": "Word", "name": "TECHIFY", ... },
    "goods": { "description": "...", "website": "..." },
    "billing": { "type": "Individual", ... }
  },
  "subtotal": 69.00,
  "vat": 13.80,
  "total": 82.80,
  "currency": "GBP",
  "created": "2025-01-15T10:30:00Z",
  "updated": "2025-01-15T10:35:00Z",
  "status": "pending"
}
```

**CRM Function**: `auditGetOrder` (defined in `CRM_ENDPOINTS`)
**Status**: ❌ Returns mock data

## Audit State Management

**Storage**: `localStorage` with key `"audit_order_state"`

**Key Fields**:
- `token` - Lead token from `/api/audit/lead`
- `orderId` - Order/Deal ID (not currently set)
- `currentStep` - Current wizard step (1-6)
- `sections{}` - All collected data by section
- `metadata` - Created/updated timestamps

**Persistence**:
- Updated after each step submission
- Restored on page refresh (allows resume)
- Cleared on confirmation page load

**See**: `public/audit/assets/js/state-manager.js` for full structure

## Audit Implementation Status

### ✅ Implemented
- Multi-step wizard UI with progress indicators
- Contact and preference collection (Steps 1-2)
- Trademark status selection (Step 3)
- Temmy search integration with live API
- Temmy results table with expand/collapse
- Single result auto-selection
- Multiple results selection with validation
- New trademark application form
- Goods/services and billing collection (Steps 4-5)
- Summary page with order review
- Social media addon with pricing calculation
- Terms & Conditions validation
- Lead creation API with incremental updates
- State persistence in localStorage
- SalesIQ visitor tracking
- Confirmation page
- Form validation with error messages
- Responsive design

### ❌ Not Implemented
**Critical Payment Flow Gap:**
1. Payment processing - `checkoutUrl` generation
2. Xero invoice creation
3. Payment status polling (no `/api/audit/payment-status` endpoint)
4. Order creation - Lead not converted to Deal/Order
5. `orderId` generation unclear

**Other Missing:**
6. Email notifications
7. CRM integration (using mock data)
8. Payment error handling and retry
9. Image upload backend processing
10. Redirect handling after Xero payment

## Required CRM Functions (Audit)

The backend expects these Zoho CRM custom functions:

1. **auditCreateLead** - Create/update Lead incrementally
   - Accepts `{ token?, lead }`
   - Returns `{ token, lead }`
   - **Status**: ❌ Not implemented (using mock)

2. **auditUpdate** - Update order sections
   - Accepts `{ orderId, section, data }`
   - For `section: "paymentOptions"`: Creates Xero invoice
   - Returns `{ orderId, success, checkoutUrl }`
   - **Status**: ❌ Not implemented (using mock)

3. **auditGetOrder** - Fetch order summary
   - Accepts `{ orderId }`
   - Returns complete order with sections, pricing
   - **Status**: ❌ Not implemented (using mock)

4. **auditCreatePayment** - Generate Xero payment link *(needed)*
   - Should create invoice with line items (base, addon, discount, VAT)
   - Returns `{ checkout_url, payment_id }`
   - **Status**: ❌ Not implemented

5. **auditGetPaymentStatus** - Poll payment status *(needed)*
   - Queries Xero payment status
   - Returns `{ status: "pending"|"paid"|"failed", updated_at }`
   - **Status**: ❌ Not implemented

## Audit Files Reference

### Frontend
- `public/audit/index.html` - Wizard page
- `public/audit/summary.html` - Order summary page
- `public/audit/confirmation.html` - Confirmation page
- `public/audit/assets/js/wizard.js` - Wizard controller (1918 lines)
- `public/audit/assets/js/summary.js` - Summary page logic
- `public/audit/assets/js/confirmation.js` - Confirmation page logic
- `public/audit/assets/js/state-manager.js` - localStorage state management
- `public/audit/assets/js/validation.js` - Form validation helpers
- `public/audit/assets/css/wizard.css` - Wizard-specific styles

### Backend
- `api/audit/lead.js` - Lead creation/update endpoint
- `api/audit/update.js` - Order update endpoint (payment options)
- `api/audit/order/[orderId].js` - Get order summary
- `api/temmy/search.js` - Temmy search proxy
- `api/_services/audit.js` - Audit service layer (304 lines)

---

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
3. Navigate to `/renewals/uk/?token=test123`
4. Submit form → order page → payment flow (uses mock data)
