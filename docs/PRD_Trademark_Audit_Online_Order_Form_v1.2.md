 # Trademark Audit Online Order Form – PRD (v1.2)

 **Project:** Trademark Audit Online Order Form  
 **Owner:** The Trademark Helpline  
 **Platform:** Static Website (Single-page wizard + summary + confirmation)  
 **Version:** 1.2 – December 2025  
 **Status:** Draft

 ---

 ## 1. Overview

 ### 1.1 Purpose

Define the requirements for developing an online order flow for the Trademark Audit service, implemented as:

 - A single-page multi-step wizard (`/audit/`) for Steps 1–8.
 - A separate Summary & Payment page (`/audit/summary/`) for Step 9.
 - A separate Confirmation page (`/audit/confirmation/`) for Step 10.

The wizard is hosted on the existing static website, uses vanilla JavaScript, and submits data to a **single unified backend endpoint** for all partial saves.

 ### 1.2 Scope

 - Multi-step wizard with conditional rendering for Steps 1–8.
 - Single unified API endpoint for saving **all** partial data.
 - Integration with Temmy search API for existing trademarks.
 - Stripe payment integration.
 - Xero invoicing integration.
 - Consistent visual styling with existing renewal forms.
 - Fully responsive layout.
 - No front-end framework (vanilla JS only).

 ### 1.3 Visual Design Reference

 - Pink/rose gradient backgrounds.
 - White card containers with subtle shadows and rounded corners (8–12px).
 - Primary CTA buttons in brand pink (#E91E63), secondary white with border.
 - Typography and spacing consistent with existing renewal forms.
 - Optional professional imagery for hero/intro sections.

 ---

 ## 2. User Flow Summary

 Logical steps (business steps) remain the same but are grouped into three pages:

 | Step | Screen Name             | Purpose                                      | Page                   |
 |------|-------------------------|----------------------------------------------|------------------------|
 | 1    | Contact Info            | Collect primary contact details              | `/audit/`              |
 | 2    | GDPR/Contact Prefs      | Capture preferred contact methods            | `/audit/`              |
 | 3    | TM Status               | Determine if existing or new trademark       | `/audit/`              |
 | 4    | Existing TM Search      | Search Temmy for existing trademark          | `/audit/`              |
 | 5    | TM Information          | Collect trademark type, name, image, jurisdictions | `/audit/`        |
 | 6    | Goods & Services        | Capture business description and website     | `/audit/`              |
 | 7    | Billing Information     | Confirm billing details                      | `/audit/`              |
 | 8    | Appointment             | Option to schedule consultation appointment  | `/audit/`              |
 | 9    | Summary & Payment       | Review order, pricing, T&Cs, process payment | `/audit/summary/`      |
 | 10   | Confirmation            | Order confirmation and next steps            | `/audit/confirmation/` |

 On `/audit/`, navigation between Steps 1–8 is handled with conditional rendering and a shared progress bar + button bar.

 ---

 ## 3. Detailed Screen Specifications

 The content and validation rules are inherited from the original PRD; below is a concise re-statement adapted to the single-page wizard structure.

 ### 3.1 Step 1 – Contact Information (`/audit/`)

 - Title: “Trademark Audit”
 - Intro: Short explanation of the audit service and when it is useful.
 - Fields (all required):
   - First Name (text, min 1 char)
   - Last Name (text, min 1 char)
   - Phone (tel, basic format)
   - Email (email, valid format)
 - Actions:
   - Primary: “Begin Audit” → validate, send to unified API with section `contact`, receive `orderId`, store `orderId` in JS state + localStorage, go to Step 2.

 ### 3.2 Step 2 – Contact Preferences (GDPR)

 - Title: “Applicant Information”
 - Prompt: “If we need to contact you about your trademark audit, what are your preferred methods of contact?”
 - Fields:
   - Multi-select checkboxes (at least one required):

     - Phone
     - SMS
     - WhatsApp
     - Email
     - Video Call (Teams)

 - Actions:
   - “Go Back” → Step 1.
   - “Continue” → validate, post with section `preferences` to unified endpoint, go to Step 3.

 ### 3.3 Step 3 – Trademark Status

 - Title: “Trademark Information”
 - Intro: Statistic about DIY application failure rates.
 - Fields (required, radio):
   - Existing Trademark – Registered
   - New Application – Unregistered
 - Branching:
   - If Existing → next visible step is Step 4 (Existing TM Search).
   - If New → skip Step 4, go directly to Step 5.
 - Actions:
   - “Go Back”
   - “Continue” → send section `tmStatus` to unified endpoint.

 ### 3.4 Step 4 – Existing Trademark Search (Conditional)

 - Shown only if `tmStatus = existing`.
 - Title: “Existing Trademark Information”
 - Prompt: “Please provide the Trademark Name and if available the Trademark Application Number”
 - Inputs:
   - Trademark Name (optional)
   - Application Number (optional; at least one of Name or Number must be provided for search)
 - Actions:
   - “Search on Temmy” → calls Temmy search API (separate endpoint, read-only).
   - Results displayed in a simple table/list with a “Select” button per row.
   - On selection:
     - Save selected TM and applicant info to JS state.
     - Optionally pre-fill TM and billing fields later.
   - “Skip to Billing Information” → branch directly to Step 7 (still possible without Temmy match).
   - “Continue” → proceed to Step 5 (if not skipping to billing).
 - Data persistence:
   - When user clicks “Continue” after selection or manual entry, send section `temmy` (selected result or “none”) to unified endpoint.

 ### 3.5 Step 5 – Trademark Information

 - Title: “Please provide information about the trademark we are auditing”
 - Fields:
   - Trademark Type (multi-select checkboxes; at least one):
     - Word Only
     - Image Only
     - Both Image & Word
   - Trademark Name (required if Word or Both selected)
   - Image Upload:
     - Option: “Yes – Upload” → show file input.
     - Option: “I will do this later or share via email”.
   - Jurisdictions (multi-select, at least one required):
     - United Kingdom, Europe, United States of America, Canada, China, Australia, New Zealand, United Arab Emirates, Saudi Arabia, Other.
 - Validation:
   - Types: not empty.
   - Name: required if Word/Both.
   - Image: if provided, file type/size check.
   - Jurisdictions: not empty.
 - Actions:
   - “Go Back”
   - “Continue” → section `tmInfo` to unified endpoint.

 ### 3.6 Step 6 – Goods & Services

 - Title: “Goods & Services”
 - Fields:
   - Business Description (textarea, optional).
   - Website URL (optional, URL validation if not empty).
 - Actions:
   - “Go Back”
   - “Continue” → section `goods` to unified endpoint.

 ### 3.7 Step 7 – Billing Information

 - Title: “Please confirm the correct billing information”
 - Pre-population:
   - If Temmy applicant data present, pre-fill name and address.
   - Default invoice email/phone from Step 1.
 - Fields (required unless noted):
   - Type: Individual / Organisation (radio).
   - Name (text).
   - Address (address lookup + manual override).
   - Postcode.
   - Invoice Email (email, default from contact).
   - Invoice Phone (tel, default from contact).
 - Actions:
   - “Go Back”
   - “Review My Order” → section `billing` to unified endpoint, then navigate to `/audit/summary/?orderId=...`.

 ### 3.8 Step 8 – Appointment

 - Title: “Trademark Audit – What Happens Next”
 - Content:
   - Step 1 – Research.
   - Step 2 – Risk Analysis.
   - Step 3 – Client Consultation.
   - Disclaimer about no ongoing obligation.
 - Prompt: “Would you like to schedule your appointment now?”
 - Actions:
   - “Yes – open booking link” → opens external calendar in new tab, sets `appointment.scheduled = true` in JS state.
   - “No – Continue to summary” → section `appointment` to unified endpoint, then redirect to `/audit/summary/?orderId=...`.

 ### 3.9 Step 9 – Summary & Payment (`/audit/summary/`)

 - Uses `orderId` (from query or localStorage) to load or reconstruct full order data.
 - Display read-only summary:
   - Contact Information.
   - Preferred contact methods.
   - Trademark details (including Temmy-derived app number, if any).
   - Jurisdictions and search platforms.
 - Social Media Add-on:
   - Checkbox: “Add Social Media Searches for only £10” (optional).
   - Platforms: Facebook, Instagram, YouTube, TikTok, LinkedIn (description only).
 - Pricing:
   - Trademark Audit: £99.00.
   - Socials Audit: £10.00 (if selected).
   - Online Audit Discount: –£40.00.
   - Net fees: £59.00 / £69.00.
   - VAT (20%) and total amount to pay.
 - T&Cs:
   - Required checkbox: “I agree to the Terms & Conditions” with link.
 - Actions:
   - “Back to details” → returns to `/audit/` with state preserved.
   - “Pay Now”:
     - Posts to unified endpoint with section `paymentOptions` containing at minimum:
       - `socialMediaAddon: boolean`
       - `termsAccepted: boolean`
     - Backend returns Stripe Checkout URL.
     - Frontend redirects to Stripe.

 ### 3.10 Step 10 – Confirmation (`/audit/confirmation/`)

 - Accessed via Stripe success URL, e.g. `/audit/confirmation/?orderId=...`.
 - Behaviour:
   - On load, optionally call backend to confirm order status and retrieve a short summary (reference, TM name).
 - Content:
   - “Thank you for your order” message.
   - Information on how/when the team will contact the user.
   - Contact details for queries.
   - Optional: show basic order reference and date.

 ---

 ## 4. Technical Requirements

 ### 4.1 Frontend Architecture

 - Static HTML pages:
   - `/audit/` – single-page wizard for Steps 1–8.
   - `/audit/summary/` – summary and payment page.
   - `/audit/confirmation/` – confirmation page.
 - Vanilla JavaScript only (no framework).
 - Shared components:
   - Progress bar (non-clickable).
   - Step content card.
   - Shared button bar.
   - Error display logic.

 ### 4.2 Unified Backend Endpoint

 All form data (partial and final) is sent to a **single unified endpoint**:

 - **Endpoint:** `POST /api/audit/update`
 - **Payload interface:**

 ```json
 {
   "orderId": "string or null",
   "section": "contact | preferences | tmStatus | temmy | tmInfo | goods | billing | appointment | paymentOptions",
   "data": {
     "...": "section-specific payload"
   }
 }
 ```

 - Behaviour:
   - If `orderId` is `null` and `section = "contact"`, backend creates a new order, assigns `orderId`, and returns it.
   - For all other sections, `orderId` must be provided and valid.
   - Backend upserts the relevant part of the order record based on `section` and `data`.
   - For `section = "paymentOptions"` backend:
     - Validates that required sections are filled (at least contact, tmInfo, billing).
     - Stores selected options (social addon, termsAccepted).
     - Creates a Stripe Checkout session and returns:

 ```json
 {
   "orderId": "string",
   "checkoutUrl": "https://..."
 }
 ```

 ### 4.3 Other Backend Endpoints

 - Temmy search (read-only, not part of the unified interface):
   - `GET /api/temmy/search?name=...&applicationNumber=...`
 - Optional order fetch for summary/confirmation (read-only):
   - `GET /api/audit/order/{orderId}` → returns aggregated order data for display only.

 ### 4.4 Stripe & Xero

 - Stripe:
   - Frontend calls unified endpoint with `section = "paymentOptions"`.
   - Backend creates Stripe Checkout session using stored order data and returns `checkoutUrl`.
   - Stripe success URL: `/audit/confirmation/?orderId=...`.
   - Stripe webhooks:
     - On successful payment, backend finalizes the audit order and triggers Xero invoicing.
 - Xero:
   - Invoice creation and status updates are handled entirely on the backend.
   - Frontend may display invoice reference if provided by `GET /api/audit/order/{orderId}`.

 ### 4.5 State & Session Management

 - A single JS state object `auditOrder` is kept in memory and mirrored to `localStorage`.
 - `orderId` is:
   - Generated at Step 1 via `section = "contact"` call.
   - Stored in `localStorage`.
   - Passed as query parameter to `/audit/summary/` and `/audit/confirmation/` when available.
 - If the user refreshes `/audit/`, state is reconstructed from `localStorage` and the user is sent to the last completed step.

 ### 4.6 Validation

 - Client-side validation for faster UX.
 - Server-side validation inside unified endpoint for security and consistency.
 - Shared rules:
   - Email format.
   - Phone basic format.
   - URL format for website field.
   - File size/type for image (max 5MB; jpg/png/gif).

 ---

 ## 5. UI/UX Specifications

 - Visual styling consistent with the existing renewal forms.
 - Progress indicator at top of `/audit/` showing “Step X of 8” with labels.
 - Single-column layout on smaller screens.
 - Accessible focus states and clear error messaging.

 ---

 ## 6. Acceptance Criteria

 1. Steps 1–8 run on `/audit/` as a single-page wizard with a working progress bar.
 2. All partial saves use `POST /api/audit/update` with the `section` key (no additional POST endpoints for sections).
 3. Temmy search works and selected TM data is persisted.
 4. Billing pre-population works when Temmy/applicant data is available.
 5. Summary page correctly loads and displays order data using `orderId`.
 6. Stripe payment flow works end-to-end and returns to confirmation page.
 7. Xero invoice is created for successful payments (via webhook).
 8. Form is fully responsive and accessible (basic level).
 9. All validations (client and server) function as expected.
 10. Navigating back and forth between steps does not lose data.
