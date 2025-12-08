# Trademark Audit Order Form – To-Do Tracker

Version: 1.0  
Related Documents:  
- PRD: Trademark Audit Online Order Form – PRD (v1.2)  
- Implementation Plan: Trademark Audit Order Form – Implementation Plan (v1.0)

---

## Legend

- **ID** – Unique task identifier.
- **Area** – Frontend / Backend / Integration / QA / Misc.
- **Owner** – Person or role responsible (to be filled by you).
- **Status** – TODO / IN_PROGRESS / BLOCKED / DONE.
- **Deps** – Dependencies (IDs of other tasks).

---

## Task List

| ID  | Area       | Title                                                   | Description                                                                                   | Owner | Status      | Deps |
|-----|------------|---------------------------------------------------------|-----------------------------------------------------------------------------------------------|-------|------------|------|
| T01 | Frontend   | Create `/audit/` HTML skeleton                          | Base HTML with progress bar, step container, and button bar.                                  |       | TODO       |      |
| T02 | Frontend   | Implement `auditOrder` state model                      | JS object with all sections and persistence to `localStorage`.                                |       | TODO       | T01  |
| T03 | Frontend   | Implement wizard navigation (`goToStep`, `renderStep`) | Step switching logic and dynamic rendering of step content.                                   |       | TODO       | T02  |
| T04 | Frontend   | Implement progress bar rendering                        | Visual “Step X of 8” indicator and labels.                                                    |       | TODO       | T03  |
| T05 | Frontend   | Step 1 UI + validation + API integration                | Contact info (fields, validation) + call unified endpoint with `section="contact"`.           |       | TODO       | T03  |
| T06 | Frontend   | Step 2 UI + validation + API integration                | Contact preferences (checkboxes) + `section="preferences"`.                                   |       | TODO       | T05  |
| T07 | Frontend   | Step 3 UI + validation + API integration                | TM status radios + branching logic + `section="tmStatus"`.                                    |       | TODO       | T06  |
| T08 | Frontend   | Step 4 UI + Temmy search integration                    | Search form, results list, selection, `section="temmy"`, plus “Skip to billing” path.         |       | TODO       | T07  |
| T09 | Frontend   | Step 5 UI + validation + API integration                | TM info form, image upload, jurisdictions + `section="tmInfo"`.                               |       | TODO       | T07  |
| T10 | Frontend   | Step 6 UI + validation + API integration                | Goods & services form + `section="goods"`.                                                    |       | TODO       | T09  |
| T11 | Frontend   | Step 7 UI + validation + API integration                | Billing form with pre-fill + `section="billing"`.                                             |       | TODO       | T08  |
| T12 | Frontend   | Step 8 UI + API integration                             | Appointment explanation, booking link, `section="appointment"`.                               |       | TODO       | T11  |
| T13 | Frontend   | `/audit/summary/` HTML skeleton                         | Base HTML for summary and payment, including pricing block and T&Cs checkbox.                 |       | TODO       |      |
| T14 | Frontend   | `audit-summary.js` data loading                         | Load order by `orderId` (`GET /api/audit/order/{orderId}` or localStorage fallback).          |       | TODO       | T13  |
| T15 | Frontend   | `audit-summary.js` pricing + add-on logic               | Calculate price based on social media add-on and output to UI.                                |       | TODO       | T14  |
| T16 | Frontend   | Payment initiation via unified endpoint                 | Call `section="paymentOptions"` and redirect to Stripe `checkoutUrl`.                         |       | TODO       | T15  |
| T17 | Frontend   | `/audit/confirmation/` HTML skeleton                    | Base confirmation page with placeholders for reference and support details.                   |       | TODO       |      |
| T18 | Frontend   | `audit-confirmation.js` order status display            | Load order data (if available) and display basic info.                                        |       | TODO       | T17  |
| T19 | Frontend   | Shared error-handling UX                               | Inline error messages, summary area, consistent visual styling.                               |       | TODO       | T05  |
| T20 | Frontend   | Responsive layout adjustments                           | Verify and fix layout for mobile/tablet/desktop.                                              |       | TODO       | T18  |
| B01 | Backend    | Define `AuditOrder` data model                          | Schema for all sections + metadata (createdAt, updatedAt, status, invoiceRef, etc.).          |       | TODO       |      |
| B02 | Backend    | Implement `POST /api/audit/update` dispatcher           | Parse `section` and route to specific handlers.                                               |       | TODO       | B01  |
| B03 | Backend    | Implement `contact` section handler                     | Create new order when `orderId` is null; store contact details.                               |       | TODO       | B02  |
| B04 | Backend    | Implement `preferences` section handler                 | Validate and store preferred contact methods.                                                 |       | TODO       | B02  |
| B05 | Backend    | Implement `tmStatus` section handler                    | Store TM status and adjust any dependent defaults if needed.                                  |       | TODO       | B02  |
| B06 | Backend    | Implement `temmy` section handler                       | Store selected Temmy record reference / applicant info.                                       |       | TODO       | B02  |
| B07 | Backend    | Implement `tmInfo` section handler                      | Validate and store TM types, name, image reference, jurisdictions.                            |       | TODO       | B02  |
| B08 | Backend    | Implement `goods` section handler                       | Store business description and website URL.                                                   |       | TODO       | B02  |
| B09 | Backend    | Implement `billing` section handler                     | Validate and store billing details.                                                           |       | TODO       | B02  |
| B10 | Backend    | Implement `appointment` section handler                 | Store appointment preference / scheduled flag.                                                |       | TODO       | B02  |
| B11 | Backend    | Implement `paymentOptions` section handler              | Validate order completeness, calculate final price, create Stripe Checkout session.           |       | TODO       | B02  |
| B12 | Backend    | Implement `GET /api/temmy/search` proxy                 | Proxy and normalize Temmy API responses.                                                      |       | TODO       |      |
| B13 | Backend    | Implement `GET /api/audit/order/{orderId}`              | Aggregate and return order data for frontend summary/confirmation.                            |       | TODO       | B01  |
| B14 | Backend    | Implement Stripe webhook handler                        | On successful payment, mark order as paid and trigger Xero invoicing.                         |       | TODO       | B11  |
| B15 | Backend    | Implement Xero invoice creation                         | Use order data to create invoice and store invoice reference.                                 |       | TODO       | B14  |
| I01 | Integration| Configure Stripe Checkout                               | Products/prices, success/cancel URLs, and allowed payment methods.                            |       | TODO       | B11  |
| I02 | Integration| Configure Xero credentials and environment              | API keys, tenants, environment variables, etc.                                                |       | TODO       | B15  |
| I03 | Integration| Configure Temmy credentials / endpoints                 | API key and base URL for Temmy.                                                               |       | TODO       | B12  |
| QA1 | QA         | Test new TM happy path                                  | Full flow with new TM, no Temmy, with social add-on, with appointment booking.               |       | TODO       | T05 |
| QA2 | QA         | Test existing TM happy path                             | Full flow with Temmy selection and no social add-on.                                          |       | TODO       | T08 |
| QA3 | QA         | Test error paths and validation                         | Missing fields, invalid formats, backend failures, network errors.                            |       | TODO       | T19 |
| QA4 | QA         | Test payment and webhooks                               | Ensure Stripe → webhook → Xero → confirmation all align.                                      |       | TODO       | B14 |
| QA5 | QA         | Test mobile/responsive views                            | Check main devices and browsers.                                                              |       | TODO       | T20 |

---

## Notes

- You can copy this table into a spreadsheet, Notion, Jira, or any other tracker.
- Add `Owner` names and update `Status` as you progress.
- If you add new sections or optional features later, append new task IDs (e.g., T21, B16, etc.).
