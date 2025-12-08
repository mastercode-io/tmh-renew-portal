Product Requirements Document

**Trademark Audit Online Order Form**

Version 1.0 - December 2025

| **Document Owner** | The Trademark Helpline |
| --- | --- |
| **Project** | Trademark Audit Online Order Form |
| **Target Platform** | Static Website (Multi-page form with backend API integration) |
| **Status** | Draft |

# 1\. Overview

## 1.1 Purpose

This document defines the requirements for developing a multi-step online order form for the Trademark Audit service. The form will be hosted on the existing static website and will submit data to a backend API at each step, ensuring data persistence throughout the user journey.

## 1.2 Scope

The implementation includes:

- 10-step form wizard with progressive data submission
- Integration with Temmy search API for existing trademarks
- Stripe payment integration
- Xero invoicing integration
- Consistent visual styling matching existing renewal forms
- Backend API endpoints for each form step

## 1.3 Visual Design Reference

The design should match the existing renewal order form styling, featuring: pink/rose gradient backgrounds, white card containers with subtle shadows and rounded corners (8-12px), primary CTA buttons in brand pink (#E91E63), secondary buttons with white background and border, consistent typography using the site's established font stack, and professional imagery where appropriate.

# 2\. User Flow Summary

The form consists of 10 sequential screens. Each screen submits partial data to the backend before progressing. Users can navigate backwards to edit previous entries.

| **Step** | **Screen Name** | **Purpose** |
| --- | --- | --- |
| 1   | Contact Info | Collect primary contact details |
| 2   | GDPR/Contact Prefs | Capture preferred contact methods |
| 3   | TM Status | Determine if existing or new trademark |
| 4   | Existing TM Search | Search Temmy for existing trademark (conditional) |
| 5   | TM Information | Collect trademark type, name, image, jurisdictions |
| 6   | Goods & Services | Capture business description and website (optional) |
| 7   | Billing Information | Confirm billing details (pre-populated if available) |
| 8   | Appointment | Option to schedule consultation appointment |
| 9   | Summary & Payment | Review order, pricing, T&Cs, and process payment |
| 10  | Confirmation | Order confirmation and next steps |

# 3\. Detailed Screen Specifications

## 3.1 Step 1: Contact Information

### Page Title

"Trademark Audit"

### Introductory Content

Display explanatory text about the Trademark Audit service including: when audits are needed (before applications, healthchecks, renewals, changes), how it helps avoid wasted application fees by providing information before committing to official fees.

### Form Fields

| **Field** | **Type** | **Required** | **Validation** |
| --- | --- | --- | --- |
| First Name | Text input | Yes | Min 1 character |
| Last Name | Text input | Yes | Min 1 character |
| Phone | Tel input | Yes | Valid phone format |
| Email | Email input | Yes | Valid email format |

### Actions

- Primary CTA: "Begin Audit" - submits data and proceeds to Step 2

## 3.2 Step 2: Contact Preferences (GDPR)

### Page Title

"Applicant Information"

### Prompt Text

"If we need to contact you about your trademark audit, what are your preferred methods of contact?"

### Form Fields

Multi-select checkboxes (at least one required):

- Phone
- SMS
- WhatsApp
- Email
- Video Call (Teams)

### Actions

- "Go Back" - returns to previous step
- "Continue" - submits data and proceeds to Step 3

## 3.3 Step 3: Trademark Status

### Page Title

"Trademark Information"

### Introductory Content

Display statistic: "Did you know that 50% of trademark applications which are done without a representative fail? Our Trademark Audit is about helping you to avoid losing money on failed applications."

### Prompt Text

"What is the purpose of this audit, is it for a new trademark application or to review an existing registered trademark?"

### Form Fields

Single-select radio buttons (required):

- "Existing Trademark - Registered"
- "New Application - Unregistered"

### Branching Logic

- If "Existing Trademark" → proceed to Step 4 (Existing TM Search)
- If "New Application" → skip to Step 5 (TM Information)

### Actions

- "Go Back"
- "Continue"

## 3.4 Step 4: Existing Trademark Search (Conditional)

### Condition

Only displayed if user selected "Existing Trademark" in Step 3.

### Page Title

"Existing Trademark Information"

### Prompt Text

"Please provide the Trademark Name and if available the Trademark Application Number"

### Functionality

Integrated search component that queries the Temmy API. User can search by trademark name or application number. Search results display matching trademarks with selection capability. Selected trademark data auto-populates subsequent fields.

### Actions

- "Search on Temmy" - triggers API search
- "Skip to Billing Information" - bypasses TM details entry

## 3.5 Step 5: Trademark Information

### Page Title

"Please provide information about the trademark we are auditing"

### Form Fields

**Trademark Type** - Multi-select checkboxes:

- Word Only - "You want to audit the Text Only such as a company name, tagline, brand or product name"
- Image Only - "You want to audit the image only such as a logo or character"
- Both Image & Word - "You want to audit both an image and a word"

**Trademark Name** - Free text input (required if Word/Both selected)

**Image Upload** - Single-select with options:

- "Yes - Upload" - shows file upload component
- "I will do this later or share via email"

**Jurisdictions** - Multi-select checkboxes (at least one required):

Helper text: "Not Sure? If not sure, start with UK as a minimum unless you already have the UK trademark registered."

Options: United Kingdom, Europe, United States of America, Canada, China, Australia, New Zealand, United Arab Emirates, Saudi Arabia, Other

### Actions

- "Go Back"
- "Continue"

## 3.6 Step 6: Goods & Services

### Page Title

"Goods & Services"

### Form Fields

**Business Description** - Multi-line text area (optional)

Prompt: "To ensure your application covers all the goods and services you provide, please provide a brief description of what your company does, the more detail the better as this will ensure we do not miss any essential classes and terms for your application."

**Website URL** - URL input (optional)

Prompt: "If you have a website please provide a link, this is purely to help with ensuring we select the right terms for your application."

### Actions

- "Go Back"
- "Continue"

## 3.7 Step 7: Billing Information

### Page Title

"Please confirm the correct billing information"

### Pre-population

If Temmy has applicant data from Step 4, pre-populate fields. Display note: "If we have applicant information from Temmy this can pre-populate - all can be amended"

### Form Fields

| **Field** | **Type** | **Required** | **Source** |
| --- | --- | --- | --- |
| Individual/Organisation | Radio buttons | Yes | Temmy (if available) |
| Name | Text input | Yes | Temmy (if available) |
| Address | Address lookup | Yes | Temmy (if available) |
| Postcode | Text input | Yes | Temmy (if available) |
| Invoice Email | Email input | Yes | Contact Info (Step 1) |
| Invoice Phone | Tel input | Yes | Contact Info (Step 1) |

### Actions

- "Go Back"
- "Review My Order"

## 3.8 Step 8: Appointment Scheduling

### Page Title

"Trademark Audit - What Happens Next"

### Content Sections

Display process overview with three steps:

- **Step 1 - Research:** Team carries out searches on trademark registers, social media platforms, domain registrations, and Companies House.
- **Step 2 - Risk Analysis:** Experts risk-grade results and prepare guidance.
- **Step 3 - Client Consultation:** Full consultation over video conference or phone.

Include disclaimer: "Please Note: Instructing our Trademark Audit Service does not commit you to any ongoing services or financial obligations."

### Prompt

"Would you like to schedule your appointment now?"

### Actions

- "Yes - open booking link" - opens external booking calendar
- "No - Continue to summary" - proceeds to Step 9

## 3.9 Step 9: Summary & Payment

### Order Summary Display

Display read-only summary of all collected data:

**Contact Information:** First Name, Last Name, Phone, Email

**Preferred Contact Methods:** Selected options from Step 2

**Trademark Details:** Application Number (or "Not Applicable" for new), Word Mark Text, Mark Type, Image preview (if uploaded)

### Search Platforms

Auto-included based on jurisdictions:

- Intellectual Property Offices (per jurisdiction)
- Companies House (UK auto-ticked)
- Domain Registrations (auto-ticked)

### Social Media Add-on

Optional upsell: "Add Social Media Searches for only £10"

Platforms: Facebook, Instagram, YouTube, TikTok, LinkedIn

### Pricing Display

| Trademark Audit | £99.00 |
| --- | --- |
| Socials Audit (if selected) | £10.00 |
| Online Audit Discount | \-£40.00 |
| **Net Fees** | **£59.00 / £69.00** |
| VAT (20%) | £11.80 / £13.80 |
| **Amount to Pay** | **£70.80 / £82.80** |

### Terms & Conditions

Checkbox (required): "I agree to the Terms & Conditions" with link to T&Cs page.

### Actions

- "Continue" - triggers Stripe payment flow, then Xero invoice generation

## 3.10 Step 10: Confirmation

### Page Title

"Thank you for your order"

### Content

Display confirmation message: "Our team will review the order information, if we have any queries one of the team will be in touch with you. If you have any queries in the meantime you can reach us on <enquiries@thetrademarkhelpline.com>, via the website or call us on 01618335400 between 9am and 6pm Monday to Friday. Thank you for choosing The Trademark Helpline."

# 4\. Technical Requirements

## 4.1 Architecture Overview

The form will be implemented as a multi-page static HTML form with JavaScript for client-side validation and API communication. Each step will be a separate page URL (e.g., /audit/step-1, /audit/step-2). This maintains the static site architecture while enabling progressive data submission.

## 4.2 Backend API Endpoints

Each step requires a POST endpoint to save partial data. An order/session ID should be generated at Step 1 and passed through subsequent steps.

| **Step** | **Endpoint** | **Payload** |
| --- | --- | --- |
| 1   | POST /api/audit/contact | firstName, lastName, phone, email |
| 2   | POST /api/audit/preferences | orderId, contactMethods\[\] |
| 3   | POST /api/audit/tm-status | orderId, tmStatus (existing\|new) |
| 4   | GET /api/temmy/search | query (name or app number) |
| 5   | POST /api/audit/tm-info | orderId, tmType\[\], tmName, image, jurisdictions\[\] |
| 6   | POST /api/audit/goods | orderId, businessDescription, websiteUrl |
| 7   | POST /api/audit/billing | orderId, type, name, address, postcode, email, phone |
| 8   | POST /api/audit/appointment | orderId, scheduledAppointment (boolean) |
| 9   | POST /api/audit/payment | orderId, socialMediaAddon, termsAccepted |

## 4.3 Third-Party Integrations

**Temmy API** - Search existing trademarks for Step 4. Endpoint should accept trademark name or application number and return matching records with applicant data for pre-population.

**Stripe** - Payment processing at Step 9. Use Stripe Checkout or Payment Intents. Handle success/failure callbacks appropriately.

**Xero** - Invoice generation post-payment. Should follow same pattern as renewal order invoicing.

## 4.4 Session Management

Order/session ID should be stored in localStorage or passed via URL parameters to maintain state across page navigations. Backend should validate session ownership to prevent data tampering.

## 4.5 Validation Requirements

- Client-side validation for immediate feedback
- Server-side validation for security
- Email format validation
- Phone number format validation (UK/international)
- URL format validation for website field
- File type/size validation for image uploads (max 5MB, jpg/png/gif)

# 5\. UI/UX Specifications

## 5.1 Visual Style Guide

**Colours**

- Primary Pink: #E91E63
- Dark Text: #1A1A2E
- Background Gradient: Pink/Rose (#FDE7EC to #FFFFFF)
- Card Background: #FFFFFF with subtle shadow

**Components**

- Cards: White background, border-radius 8-12px, subtle box-shadow
- Primary Buttons: Pink background (#E91E63), white text, rounded corners
- Secondary Buttons: White background, dark border, dark text
- Form Inputs: Full-width, adequate padding, clear focus states
- Checkboxes/Radios: Custom styled to match brand

## 5.2 Progress Indicator

Consider adding a step indicator (e.g., "Step 3 of 9") or progress bar to show users their position in the form flow. This should be non-clickable (users navigate via Go Back/Continue only).

## 5.3 Responsive Design

Form must be fully responsive: single column layout on mobile, comfortable padding, touch-friendly input sizes (minimum 44px tap targets), readable text sizes without zooming.

## 5.4 Error Handling

Inline error messages below invalid fields, highlighted border on invalid inputs, summary of errors at form top for accessibility, clear error messages in plain English.

# 6\. Acceptance Criteria

- All 10 steps render correctly and are navigable
- Data persists at each step via API submission
- Conditional branching works correctly (existing vs new trademark)
- Temmy search returns and displays results correctly
- Temmy data pre-populates billing fields when available
- Image upload functions correctly with preview
- Pricing calculates correctly based on add-ons
- Stripe payment processes successfully
- Xero invoice generates post-payment
- Form is fully responsive across devices
- Visual styling matches existing renewal forms
- All validation rules enforced client and server side

# 7\. Appendix

## 7.1 Jurisdiction Options

United Kingdom, Europe, United States of America, Canada, China, Australia, New Zealand, United Arab Emirates, Saudi Arabia, Other

## 7.2 Contact Method Options

Phone, SMS, WhatsApp, Email, Video Call (Teams)

## 7.3 Social Media Platforms

Facebook, Instagram, YouTube, TikTok, LinkedIn

## 7.4 Reference URLs

- Existing TM Application Form: <https://www.thetrademarkhelpline.com/tm-app/>
- Pricing Reference: <https://www.tramatm.com/detailed-pricelist>
