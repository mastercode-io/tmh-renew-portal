# Trademark Audit Online Order Form – PRD (v1.3)
**Status:** Final  
**Supersedes:** v1.2  
**Primary References:** Audit_Online_Order.md (client-supplied content)  

---

# 0. Persistent Service Description (Shown on Steps 1–8)

## **Trademark Audit Service – What It Does**  
A Trademark Audit evaluates your proposed or existing trademark against relevant registers, identifies potential conflicts or risks, checks the suitability of classes and jurisdictions, and provides clear guidance before you commit to non‑refundable official trademark application fees.

This block MUST appear at the top of every wizard step (1–8), above step-specific content.

Step 1 additionally displays the full introductory text from the Excel outline.

---

# 1. Overview

This PRD defines the requirements for the Trademark Audit online order flow.  
This revision aligns the PRD fully with client‑provided text from **Audit_Online_Order.md** (all wording MUST be verbatim).

### Architecture Summary
- Steps 1–8 → Single-page wizard (`/audit/`) with conditional rendering  
- Step 9 → Summary & Payment (`/audit/summary/`)  
- Step 10 → Thank You page (`/audit/confirmation/`)  
- Unified endpoint → `POST /api/audit/update`  
- Temmy Search → separate read-only endpoint  
- Stripe Checkout + Xero invoice generation (server-side)

---

# 2. Wizard Steps (Fully Updated to Match Excel)

Below, **all step text is EXACTLY as in Audit_Online_Order.md**.

---

# STEP 1 – Contact Info (Wizard)

## Full Intro Block (shown ONLY on Step 1)
**Trademark Audit**

**About our Trademark Audit Service**

**When do you need a trademark audit?**  
Trademark Audits are most commonly used before making a trademark application, as a Trademark Healthcheck, when looking to make changes to an existing trademark for example; adding or removing goods and services your trademark is registered for (Classes & Terms), expanding into other territories & jurisdictions or when your trademark is coming up for renewal

**How does it help you?**  
The purpose of a Trademark Audit is to avoid wasting money on failed application fees by giving you all the information you need to make educated choices about your trademark before committing to paying any official fees to trademark registers such as the UK Intellectual Property Office, as those fees are non-refundable.

---

## Form Section (below persistent short service description + full intro)
**Firstly, who will be the person we will be dealing with for the trademark audit?**

Fields:
- First Name  
- Last Name  
- Phone  
- Email  

Button:
- **[Begin Audit]**

Unified endpoint call:
```
section: "contact"
```

---

# STEP 2 – GDPR / Contact Preferences

**Applicant Information**

If we need to contact you about your trademark audit, what are your preferred methods of contact?

Multi-select:
- Phone  
- SMS  
- Whatsapp  
- Email  
- Video Call (Teams)

Buttons:
- **[Go Back]**
- **[Continue]**

Unified endpoint:
```
section: "preferences"
```

---

# STEP 3 – Trademark Status

**Trademark Information**

Did you know that 50% of trademark applications which are done without a representative fail? Our Trademark Audit is about helping you to avoid losing money on failed applications.

**What is the purpose of this audit, is it for a new trademark application or to review an existing registered trademark?**

Single-select:
- Existing Trademark – Registered  
- New Application – Unregistered  

Buttons:
- **[Go Back]**
- **[Continue]**

Logic:
- If existing → Step 4  
- If new → Step 5  

Unified endpoint:
```
section: "tmStatus"
```

---

# STEP 4 – Existing Trademark Search (Conditional)

**Existing Trademark Information**

Please provide the Trademark Name and if available the Trademark Application Number

Buttons:
- **[Search on Temmy]**
- **[Skip to Billing Information]**
- *(After search + selection)* → **[Continue]**

Temmy search:
`GET /api/temmy/search`

Unified endpoint:
```
section: "temmy"
```

---

# STEP 5 – Trademark Information

**Please provide information about the trademark we are auditing**

**What type of trademark application is it?**  
(Multi-select)
- Word Only – You want to audit the Text Only such as a company name, tagline, brand or product name  
- Image Only – You want to audit the image only such as such as a logo or character.  
- Both Image & Word – You want to audit both an image and a word  

**What is the trademark name?**  
Free text field

**Do you have an image you would like to upload now?**
Single-select:
- Yes – Upload  
- I will do this later or share via email  

**Jurisdictions (choose all that apply)**  
(*Not Sure? If not sure, start with UK…*)
- United Kingdom  
- Europe  
- United States of America  
- Canada  
- China  
- Australia  
- New Zealand  
- United Arab Emirates  
- Saudi Arabia  
- Other  

Buttons:
- **[Go Back]**
- **[Continue]**

Unified endpoint:
```
section: "tmInfo"
```

---

# STEP 6 – Goods & Services

**Goods & Services**

To give ensure your application covers all the goods and services you provide, please provide a brief description of what your company does, the more detail the better as this will ensure we do not miss any essential classes and terms for your application. (optional)

Free text field

If you have a website please provide a link… (optional)

Buttons:
- **[Go Back]**
- **[Continue]**

Unified endpoint:
```
section: "goods"
```

---

# STEP 7 – Billing Information

**Please confirm the correct billing information**

If we have applicant information from Temmy this can pre-populate – all can be amended.

Fields:
- Individual or Organisation  
- Name  
- Address  
- Postcode  
- Email for Invoice  
- Phone number for invoice  

Buttons:
- **[Go Back]**
- **[Review My Order]**

Unified endpoint:
```
section: "billing"
```

---

# STEP 8 – Appointment

**Trademark Audit**

**What Happens Next**

**Step 1 – Research**  
Our team will carry out…

**Step 2 – Risk Analysis**

**Step 3 – Client Consultation**

**Please Note:** Instructing our Trademark Audit Service does not commit you…

**Would you like to schedule your appointment now?**

Options:
- Yes – open booking link  
- No – Continue to summary  

Buttons:
- **[Go Back]**
- **[Continue]**

Unified endpoint:
```
section: "appointment"
```

---

# STEP 9 – Summary & Payment (Separate Page)

Displays exactly the content of Tab 9, including:

- Contact Info  
- Preferred Contact Methods  
- Trademark Details  
- Search Platforms  
- Add Social Media Searches for £10  
- Pricing table  
- [Agree to Terms & Conditions]  

Button:
- **[Continue]** → triggers payment flow

Unified endpoint:
```
section: "paymentOptions"
```

Backend returns `checkoutUrl` → redirect to Stripe.

---

# STEP 10 – Post-Payment Thank You Page

Text exactly as in Tab 10.

---

# 3. Technical Requirements (Updated)

(unchanged from v1.2, except text updates)

- Persistent short description on Steps 1–8  
- Step 1 includes full intro  
- Wizard structure unchanged  
- Unified endpoint unchanged  
- All labels/buttons now match Excel exactly  

---

