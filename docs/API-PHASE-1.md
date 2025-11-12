# ✅ Renewal Portal — Phase 1 To-Do List

> Objective: release the first production version of the Renewal Portal to accept live payments via **Xero**, while building the base for later migration to **Zoho Billing** for reporting and subscription management.

---

## A. Renewal Page → CRM

### [ ] 1. `GET /renewal/details?token=<encrypted_id>`

- Decrypt token and fetch **Lead** (or **Deal**) and related **Trademark** record.
- Return all data needed for the landing page:
  - Contact name, mark name/type, application number, number of classes, fees, expiry date, etc.

### [ ] 2. `POST /renewal/order`

- Convert **Lead → Account + Contact** (if not already converted).
- Create or update **Deal** for the renewal.
- Link the relevant **Trademark** record to the Deal.
- Pull related **Price Book** and add required products:
  - `UKIPOTMREN`, `UKTMRENNEW`, `ONL-REN-DIS`, `UKCLASSADMIN`, `UKIPOCLASS`.
- Return an **order summary** (Deal ID, line items, VAT, total) for the “Renewal Order” page.

### [ ] 3. `GET /renewal/order/{dealId}`

- Return the current Deal line items, VAT, total, and metadata.
- Used to render or refresh the Renewal Order page.

---

## B. “Pay Now” → Xero Invoice + Redirect

### [ ] 4. `GET /renewal/{dealId}/payment-link`

- Ensure **Xero Contact** exists (create if missing; store `XeroContactID` on CRM Contact/Deal).
- Create **AUTHORISEd Xero Invoice** from Deal line items.
- Store `XeroInvoiceID` + `InvoiceNumber` on the Deal.
- Retrieve **OnlineInvoiceUrl** via Xero API.
- Respond with:
  ```json
  {
    "payment_url": "<OnlineInvoiceUrl>",
    "deal_token": "..."
  }
  ```
- Front-end opens `payment_url` in a new tab and switches to “Waiting for payment” state.

### [ ] 5. `GET /renewal/payment-status?token=<deal_token>`

- Look up `XeroInvoiceID` from the Deal using the encrypted token.
- Fetch invoice from Xero and return a simplified status:
  - `pending | paid | failed | not_found | timeout`
- When status = `paid`:
  - Update CRM Deal stage → **Paid/Completed**.
  - Record `paid_at` and optional `payment_method`.

### [ ] 6. (Later) `POST /webhooks/xero`

- Optional webhook listener for invoice updates.
- On “invoice paid” → update CRM + shadow Zoho Billing entities.
- Reduces need for polling.

---

## C. Parallel “Shadow” Sync into Zoho Billing (Reporting Only)

### [ ] 7. Extend `/renewal/start` to create customer + quote

- After creating the Deal:
  - Ensure **Customer** exists in Zoho Billing (store `ZB_CustomerID`).
  - Create matching **Quote** in Zoho Billing with same line items and totals.
  - Store `ZB_QuoteID` on the Deal.

### [ ] 8. Create Zoho Billing invoice alongside Xero invoice

- Inside `/renewal/{dealId}/create-invoice-and-pay`:
  - Convert the Zoho Billing Quote → Invoice\
    *(or create an Invoice directly)*.
  - Store `ZB_InvoiceID` on the Deal.
  - Leave invoice **Unpaid** for now.

### [ ] 9. Mirror payment to Zoho Billing when Xero invoice is paid

- When `/payment-status` detects a **paid** invoice:
  - Call Zoho Billing API to **record payment** for `ZB_InvoiceID`.
  - Keep Zoho Billing aligned for reporting, even though funds flow through Xero.

---

## D. Supporting Tasks

### [ ] 10. Error & Timeout Handling

- Define max polling duration (e.g., 10–15 min).
- Return `timeout` response for UI message:
  > “We haven’t seen your payment yet. Please try again or contact us.”

### [ ] 11. Admin & Debug Tools

- Create lightweight admin API/view to search by `DealId` or `XeroInvoiceNumber`:
  - Show CRM deal status
  - Xero invoice status
  - Zoho Billing invoice status
  - Helpful for debugging reconciliation

---

### Notes

- Phase 1 focuses on **Xero → Stripe** payments only.
- Zoho Billing is used for **mirroring and reporting**, not live transactions.
- Future phases will replace the Xero invoice step with a **Zoho Billing hosted page**.
