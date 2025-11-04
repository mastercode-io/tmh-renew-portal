# Revised Renewal Landing Page - Payload Specification

## Overview

This document describes the revised JSON payload structure for the renewal landing page. The main changes from the previous version:

- `request_id` → `token`
- Split into `account` and `contact` objects
- Singular `trademark` (the one being renewed)
- `next_due` array contains OTHER upcoming renewals
- Support for trademark images via `image_url`

## URL Parameter

```
https://renewal.example.com/?token=tok_abc123xyz
```

## API Endpoint

```
GET /api/prefill?token=tok_abc123xyz
```

Returns the payload structure below.

---

## Top-Level Structure

```json
{
  "account": { ... },
  "contact": { ... },
  "trademark": { ... },
  "next_due": [ ... ],
  "links": { ... }
}
```

**Note:** Token validation and expiration is handled entirely on the backend. The token is passed via URL parameter (`?token=xxx`) but not included in the response payload.

---

## 1. `account` (Required)

Information about the trademark owner's account.

### For Organizations

```json
{
  "type": "organization",
  "name": "Tech Innovations Ltd",
  "company_number": "09876543",
  "vat_number": "GB123456789",
  "address": {
    "line1": "123 High Street",
    "line2": "Suite 4B",
    "city": "Manchester",
    "postcode": "M1 1AA",
    "country": "United Kingdom"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | Must be `"organization"` |
| `name` | Yes | Company/organization name |
| `company_number` | No | Company registration number |
| `vat_number` | No | VAT registration number |
| `address` | Yes | Registered address object |

### For Individuals

```json
{
  "type": "individual",
  "name": "John Michael Smith",
  "address": {
    "line1": "45 Oak Avenue",
    "line2": null,
    "city": "London",
    "postcode": "SW1A 1AA",
    "country": "United Kingdom"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | Must be `"individual"` |
| `name` | Yes | Full legal name |
| `address` | Yes | Residential address object |

### Address Object

| Field | Required | Description |
|-------|----------|-------------|
| `line1` | Yes | First line of address |
| `line2` | No | Second line (suite, flat, etc.) - can be `null` |
| `city` | Yes | City/town |
| `postcode` | Yes | Postal/ZIP code |
| `country` | Yes | Country name |

---

## 2. `contact` (Required)

Details about the person we're contacting. Used for authorization forms and billing.

```json
{
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah.johnson@example.com",
  "mobile": "+44 7700 900123",
  "phone": "+44 161 123 4567",
  "position": "Managing Director"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `first_name` | Yes | Contact's first name |
| `last_name` | Yes | Contact's last name |
| `email` | Yes | Contact email address |
| `mobile` | Yes | Mobile/cell phone number with country code |
| `phone` | No | Landline/office phone - can be `null` |
| `position` | No | Job title/position (for organizations) - can be `null` |

**Usage:**
- Prefills form fields
- Hero greeting: "Hi {first_name}"
- Authorization: "{first_name} {last_name} is authorized to renew"

---

## 3. `trademark` (Required)

The trademark that is being renewed in this session.

```json
{
  "id": "tm_001",
  "word_mark": "TECHIFY",
  "mark_type": "Word Mark",
  "status": "Registered",
  "jurisdiction": "UK",
  "application_number": "UK00003456789",
  "registration_number": "UK00003456789",
  "application_date": "2014-06-20",
  "registration_date": "2015-06-20",
  "expiry_date": "2025-06-20",
  "next_renewal_date": "2025-06-20",
  "image_url": null,
  "classes": [ ... ],
  "classes_count": 2,
  "proprietor": { ... }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Internal reference ID |
| `word_mark` | Yes | Trademark text/name |
| `mark_type` | Yes | "Word Mark", "Logo", "Series Mark", "Device Mark", etc. |
| `status` | Yes | "Registered", "Pending", etc. |
| `jurisdiction` | Yes | "UK", "EU", "US", etc. |
| `application_number` | Yes | Official application number |
| `registration_number` | Yes | Official registration number |
| `application_date` | Yes | When applied (YYYY-MM-DD) |
| `registration_date` | Yes | When registered (YYYY-MM-DD) |
| `expiry_date` | Yes | When current registration expires (YYYY-MM-DD) |
| `next_renewal_date` | Yes | When renewal is due (YYYY-MM-DD) |
| `image_url` | No | URL to trademark image/logo - `null` for word marks |
| `classes` | Yes | Array of Nice classification objects |
| `classes_count` | Yes | Number of classes (integer) |
| `proprietor` | Yes | Current registered owner details |

### Image Handling

For logo/device marks, provide a direct URL to the image:

```json
"image_url": "https://cdn.example.com/trademarks/tm_001_logo.png"
```

- Should be a publicly accessible URL
- Recommended formats: PNG, JPG, SVG
- Recommended size: 400x400px max
- Can be a CDN link or download endpoint
- Frontend will display with `<img>` tag

For word marks:
```json
"image_url": null
```

### Classes Array

```json
"classes": [
  {
    "nice": "9",
    "description": "Computer software; mobile applications"
  },
  {
    "nice": "42",
    "description": "Software development services; IT consulting"
  }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `nice` | Yes | Nice classification number (string) |
| `description` | Yes | Goods/services description |

### Proprietor Object

```json
"proprietor": {
  "name": "Tech Innovations Ltd",
  "address": "123 High Street, Manchester, M1 1AA, United Kingdom"
}
```

Current registered owner on the trademark. May differ from `account` if ownership has changed.

---

## 4. `next_due` (Optional)

Array of OTHER trademarks coming up for renewal, sorted by expiry date (earliest first).

```json
"next_due": [
  {
    "id": "tm_002",
    "word_mark": "INNOVATE PRO",
    "mark_type": "Logo",
    "status": "Registered",
    "jurisdiction": "UK",
    "application_number": "UK00003567890",
    "registration_number": "UK00003567890",
    "application_date": "2015-08-15",
    "registration_date": "2016-08-15",
    "expiry_date": "2026-08-15",
    "next_renewal_date": "2026-08-15",
    "image_url": "https://cdn.example.com/trademarks/tm_002.png",
    "classes": [ ... ],
    "classes_count": 3,
    "proprietor": { ... }
  }
]
```

- Same structure as `trademark`
- Displayed in "Next Renewals Due" section
- Can be empty array `[]` if no other renewals
- Should NOT include the main `trademark` being renewed

---

## 5. `links` (Optional)

Technical links for page actions.

```json
{
  "book_call": "https://bookings.thetrademarkhelpline.com/#/4584810000004811044",
  "manage_prefs": "https://portal.example.com/preferences",
  "terms_conditions": "https://www.example.com/terms"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `book_call` | No | URL for booking consultation (hardcoded if omitted) |
| `manage_prefs` | No | URL to manage communication preferences |
| `terms_conditions` | No | URL to Terms & Conditions page |

---

## Minimal Required Payload

The absolute minimum to render the page:

```json
{
  "account": {
    "type": "individual",
    "name": "John Smith",
    "address": {
      "line1": "123 Main St",
      "city": "London",
      "postcode": "SW1A 1AA",
      "country": "UK"
    }
  },
  "contact": {
    "first_name": "John",
    "last_name": "Smith",
    "email": "john@example.com",
    "mobile": "+44 7700 900000"
  },
  "trademark": {
    "id": "tm_001",
    "word_mark": "BRAND NAME",
    "mark_type": "Word Mark",
    "status": "Registered",
    "jurisdiction": "UK",
    "application_number": "UK00003123456",
    "registration_number": "UK00003123456",
    "application_date": "2014-12-31",
    "registration_date": "2015-12-31",
    "expiry_date": "2025-12-31",
    "next_renewal_date": "2025-12-31",
    "image_url": null,
    "classes": [
      {
        "nice": "9",
        "description": "Software"
      }
    ],
    "classes_count": 1,
    "proprietor": {
      "name": "John Smith",
      "address": "123 Main St, London, SW1A 1AA, UK"
    }
  },
  "next_due": []
}
```

---

## Example Usage

### Page URL
```
https://renewal.example.com/?token=tok_abc123
```

### API Call
```javascript
const token = new URLSearchParams(window.location.search).get('token');
const response = await fetch(`/api/prefill?token=${token}`);
const data = await response.json();
```

### Displaying Trademark Image

```javascript
if (data.trademark.image_url) {
  // Logo/Device mark
  const img = document.createElement('img');
  img.src = data.trademark.image_url;
  img.alt = data.trademark.word_mark;
} else {
  // Word mark - show text
  element.textContent = data.trademark.word_mark;
}
```

---

## Token Security (Backend Only)

The token is passed via URL parameter but **not included in the JSON response**. Token validation and expiration is handled entirely on the backend.

### URL Parameter
```
https://renewal.example.com/?token=tok_abc123xyz
```

### Backend Token Handling

**On Page Load (GET /api/prefill?token=xxx):**
1. Validate token exists
2. Validate token not expired
3. Validate token not already used (if applicable)
4. Return personalized payload (without security object)

**On Form Submission (POST /api/lead):**
1. Validate token again
2. Process renewal request
3. **Mark token as used** (expires the token)
4. Return order details

### Token Lifecycle
```
1. Token created → Active
2. User loads page → Validated (still active)
3. User submits form → Marked as "used"
4. Token now expired → Cannot be used again
```

This prevents:
- Resubmitting the same renewal
- Sharing link after use
- Unauthorized access to other renewals

---

## Validation Rules

1. **Account type** must be `"organization"` or `"individual"`
2. **Email** must be valid format
3. **Phone numbers** should include country code (e.g., `+44`)
4. **Dates** must be ISO 8601 format (YYYY-MM-DD)
5. **Expiry date** should be in the future
6. **Token** (backend) must be unique and unexpired
7. **Image URL** must be publicly accessible (CORS-enabled)
8. **Classes array** must not be empty
9. **`next_due`** should NOT contain the main `trademark`

---

## Migration from Old Structure

### Key Changes

| Old | New |
|-----|-----|
| `request_id` | `token` |
| `person` | `contact` + `account` |
| `organisation` | `account` (when type="organization") |
| `trademarks[]` | `trademark` (singular) |
| `next_due.trademark_id` | `next_due[]` (array of full objects) |

### Example Migration

**Old:**
```json
{
  "person": {"first_name": "John", ...},
  "organisation": {"name": "ACME Ltd", ...},
  "trademarks": [{...}, {...}],
  "next_due": {"trademark_id": "tm_001"}
}
```

**New:**
```json
{
  "account": {"type": "organization", "name": "ACME Ltd", ...},
  "contact": {"first_name": "John", ...},
  "trademark": {...},
  "next_due": [{...}]
}
```

---

## Files

- `revised-payload-structure.json` - Organization example
- `revised-payload-individual.json` - Individual example
- `REVISED-PAYLOAD-SPEC.md` - This specification
