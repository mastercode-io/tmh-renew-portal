# Trademark Audit Order Form – Implementation Plan

Version: 1.0  
Related PRD: Trademark Audit Online Order Form – PRD (v1.2)

---

## 1. Goals

- Implement a single-page wizard for Steps 1–8 on `/audit/` using vanilla JavaScript.
- Use a **single unified backend endpoint** (`POST /api/audit/update`) for all partial saves.
- Implement a Summary & Payment page (`/audit/summary/`) and a Confirmation page (`/audit/confirmation/`).
- Integrate Temmy search, Stripe Checkout, and Xero invoicing (via backend/webhooks).
- Ensure the implementation is consistent with existing portal design and lightweight architecture.

---

## 2. High-Level Architecture

### 2.1 Frontend

- Static HTML:
  - `audit.html` → `/audit/`
  - `audit-summary.html` → `/audit/summary/`
  - `audit-confirmation.html` → `/audit/confirmation/`
- JavaScript bundles:
  - `audit.js` – wizard logic and state management.
  - `audit-summary.js` – summary rendering and payment initiation.
  - `audit-confirmation.js` – confirmation rendering.
- CSS:
  - Reuse existing base styles.
  - Add audit-specific styles only where needed (progress bar, step layout).

### 2.2 Backend

- Unified endpoint:
  - `POST /api/audit/update`
- Read-only endpoints:
  - `GET /api/temmy/search`
  - `GET /api/audit/order/{orderId}` (optional, recommended)
- Integrations:
  - Stripe Checkout for payments.
  - Xero for invoices (triggered via Stripe webhook).

---

## 3. Unified Endpoint Contract

**Endpoint:** `POST /api/audit/update`

**Request payload (generic):**

```json
{
  "orderId": "string or null",
  "section": "contact | preferences | tmStatus | temmy | tmInfo | goods | billing | appointment | paymentOptions",
  "data": {
    "...": "section-specific fields"
  }
}
```

**Response (generic):**

```json
{
  "orderId": "string",
  "status": "ok",
  "message": "optional descriptive text",
  "checkoutUrl": "optional, for paymentOptions",
  "data": {
    "...": "optional, e.g., normalized order data"
  }
}
```

Behaviour notes:

- `section = "contact"`:
  - `orderId` may be `null` → backend must create new order and return `orderId`.
- All other sections:
  - `orderId` must refer to an existing order; backend validates and upserts partial data.
- `section = "paymentOptions"`:
  - Backend validates order completeness and terms acceptance.
  - Creates Stripe Checkout session.
  - Returns `checkoutUrl` for frontend redirect.

---

## 4. Step-by-Step Frontend Implementation

### 4.1 Wizard Skeleton (`/audit/` + `audit.js`)

1. Create `audit.html` with:
   - Header area (breadcrumbs / hero text if needed).
   - Progress bar container (`<div id="audit-progress"></div>`).
   - Main card container (`<div id="audit-step-container"></div>`).
   - Button bar (`<div id="audit-buttons"></div>` for Back/Continue).
2. In `audit.js`:
   - Define global `auditOrder` state object with fields:
     - `orderId`, `currentStep`, `contact`, `preferences`, `tmStatus`, `temmy`, `tmInfo`, `goods`, `billing`, `appointment`, `payment`.
   - Implement:
     - `initAuditWizard()`:
       - Load any saved state from `localStorage`.
       - Determine starting step (1 or last completed).
       - Bind DOM events.
     - `goToStep(stepNumber)`:
       - Update `auditOrder.currentStep`.
       - Call `renderStep(stepNumber)` and `renderProgress()`.
     - `renderStep(stepNumber)`:
       - Inject correct HTML fragment into `audit-step-container`.
       - Each step’s HTML can be created via template functions or hidden DOM blocks.
     - `renderProgress()`:
       - Render “Step X of 8” and label markers.
     - `saveState()`:
       - Serialize `auditOrder` to `localStorage`.

### 4.2 Validation Layer

- Implement `validateStep(stepNumber)`:
  - Returns `{ valid: boolean, errors: { fieldName: "message" } }`.
  - Handles required fields and format checks per PRD.
- Error handling:
  - Inline messages below fields.
  - Optionally, summary block at top.

### 4.3 API Helper

- Implement a small helper function in `audit.js`:

```js
async function postAuditUpdate(section, data) {
  const payload = {
    orderId: auditOrder.orderId || null,
    section,
    data
  };

  const response = await fetch("/api/audit/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to save data");
  }

  const result = await response.json();

  if (result.orderId && !auditOrder.orderId) {
    auditOrder.orderId = result.orderId;
  }

  return result;
}
```

- Use `postAuditUpdate()` in each step after successful validation.

### 4.4 Implement Steps 1–8

For each step:

- Gather current step values from DOM.
- Validate.
- Call `postAuditUpdate()` with appropriate `section` and `data`.
- Update `auditOrder` and `localStorage`.
- Call `goToStep(nextStep)` or redirect to summary.

Temmy integration (Step 4):
- Add separate helper `searchTemmy(params)` calling `GET /api/temmy/search`.
- Render a basic result list with selection.
- On “Select”, store chosen record under `auditOrder.temmy` and optionally auto-fill some fields.

---

## 5. Summary & Payment Page (`/audit/summary/` + `audit-summary.js`)

1. `audit-summary.html`:
   - Content placeholders for:
     - Contact summary.
     - TM summary.
     - Billing summary.
     - Pricing and add-ons.
     - T&Cs checkbox + “Pay Now” button.
2. `audit-summary.js`:
   - On load:
     - Read `orderId` from query string or `localStorage`.
     - Option A (preferred): fetch `GET /api/audit/order/{orderId}` for canonical data.
     - Option B: fall back to `localStorage.auditOrder` if read-only endpoint is not available.
   - Render summary sections from the data.
   - Add handler for social media add-on toggle to recalc pricing.
   - On “Pay Now”:
     - Ensure T&Cs checkbox is checked.
     - Call `postAuditUpdate("paymentOptions", { socialMediaAddon, termsAccepted: true })`.
     - Redirect to returned `checkoutUrl`.

---

## 6. Confirmation Page (`/audit/confirmation/` + `audit-confirmation.js`)

1. `audit-confirmation.html`:
   - Basic “Thank you” text and placeholders for optional info (reference, TM name).
2. `audit-confirmation.js`:
   - Read `orderId` from query string or `localStorage`.
   - Optionally call `GET /api/audit/order/{orderId}` to display key data.
   - Show generic success message if details cannot be loaded.
3. Stripe:
   - Ensure Stripe success URL is configured as `/audit/confirmation/?orderId={ORDER_ID_PLACEHOLDER}`.

---

## 7. Backend Implementation Outline

1. Data model:
   - Single `AuditOrder` entity with fields for each section:
     - `id`, `status`, `contact`, `preferences`, `tmStatus`, `temmy`, `tmInfo`, `goods`, `billing`, `appointment`, `paymentOptions`, `createdAt`, `updatedAt`, etc.
2. Unified endpoint:
   - Implement switch or dispatcher on `section`:
     - Validate `data` for that section.
     - Merge into persisted order record.
     - When `section = "paymentOptions"`:
       - Validate minimum required sections are present.
       - Calculate final price.
       - Create Stripe Checkout session.
       - Save Stripe session info.
       - Return `checkoutUrl`.
3. Temmy search endpoint:
   - Proxy request to Temmy API.
   - Normalize result fields.
4. Optional order read endpoint:
   - Aggregate stored fields into a single response for summary/confirmation display.

5. Stripe + Xero:
   - Webhook handler for successful payment:
     - Mark order as `paid`.
     - Create Xero invoice based on order data.
     - Save invoice reference on the order.

---

## 8. Testing Strategy

- Unit tests for unified endpoint section handlers.
- End-to-end tests for:
  - New TM flow (with and without social add-on).
  - Existing TM flow with Temmy match.
  - Back/forward navigation and page refresh.
  - Payment success → confirmation → Xero invoice creation.
- Manual testing on mobile and desktop viewports.

---

## 9. Non-Goals

- No client-side routing library.
- No deep analytics or custom event tracking in this iteration.
- No multi-language support in v1.
