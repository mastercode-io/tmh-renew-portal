# Renewal Landing Page - Minimal Payload Specification

## Overview

This document describes the minimal JSON payload required to render the renewal landing page (`index.html`). Order details are loaded separately via a different endpoint.

## Minimal Required Payload

```json
{
  "person": {
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@example.com",
    "mobile": "+44 7700 900000"
  },
  "trademarks": [
    {
      "id": "tm_001",
      "word_mark": "EXAMPLE BRAND",
      "mark_type": "Word Mark",
      "application_number": "UK00003123456",
      "expiry_date": "2025-03-15",
      "classes_count": 2
    }
  ],
  "next_due": {
    "trademark_id": "tm_001",
    "expiry_date": "2025-03-15"
  }
}
```

## Field Descriptions

### `person` (Required)
Used for personalization and form prefilling.

| Field | Required | Usage |
|-------|----------|-------|
| `first_name` | Yes | Hero greeting: "Hi {first_name}" |
| `last_name` | Yes | Combined with first_name for full name display |
| `email` | Yes | Prefills contact email field |
| `mobile` | Yes | Prefills contact phone field |

**Alternative**: Can use `full_name` instead of `first_name` + `last_name`:
```json
"person": {
  "full_name": "John Smith",
  "email": "john.smith@example.com",
  "mobile": "+44 7700 900000"
}
```

### `organisation` (Optional)
Organization details for the trademark owner.

| Field | Required | Usage |
|-------|----------|-------|
| `name` | No | Display organization name |
| `company_number` | No | Display company registration number |

### `trademarks` (Required)
Array of trademarks for this client. At least one trademark is required.

| Field | Required | Usage |
|-------|----------|-------|
| `id` | Yes | Internal reference, matched with `next_due.trademark_id` |
| `word_mark` | Yes | Trademark text displayed in hero and renewals list |
| `mark_type` | Yes | "Word Mark", "Logo", "Series Mark", etc. |
| `status` | No | "Registered", "Pending", etc. |
| `jurisdiction` | No | "UK", "EU", "US", etc. |
| `application_number` | Yes | Displayed in hero greeting and form |
| `registration_number` | No | Official registration number |
| `registration_date` | No | When trademark was registered |
| `expiry_date` | Yes | Renewal deadline - displayed in renewals list |
| `classes` | No | Array of Nice classification objects |
| `classes_count` | Yes | Number of classes (used in renewals list) |

**Minimal trademark object**:
```json
{
  "id": "tm_001",
  "word_mark": "BRAND NAME",
  "mark_type": "Word Mark",
  "application_number": "UK00003123456",
  "expiry_date": "2025-03-15",
  "classes_count": 2
}
```

### `next_due` (Required)
Identifies which trademark is coming up for renewal.

| Field | Required | Usage |
|-------|----------|-------|
| `trademark_id` | Yes | Matches `trademarks[].id` to select primary trademark |
| `expiry_date` | Yes | Displayed in hero section |

### `prefill` (Optional but Recommended)
Pre-populates form fields and sets default answers.

```json
"prefill": {
  "contact": {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "mobile": "+44 7700 900000"
  },
  "trademark": {
    "id": "tm_001"
  },
  "authorisations": {
    "ownership_change": null,
    "classification_change": null,
    "authorized": null
  }
}
```

- If omitted, form uses data from `person` object
- `authorisations` fields can be `null`, `true`, or `false` to pre-select radio buttons

### `links` (Optional)
Action links for the page.

| Field | Required | Usage |
|-------|----------|-------|
| `book_call` | No | URL for "Book a Call" buttons (default hardcoded) |
| `pay_now` | No | Payment URL (loaded with order data instead) |
| `manage_prefs` | No | Link to manage communication preferences |

### `security` (Optional)
Security and session information.

| Field | Required | Usage |
|-------|----------|-------|
| `request_id` | No | One-time use token for this renewal session |
| `expires_at` | No | When this renewal link expires (ISO 8601) |

## Data Flow

### Page Load
1. Page loads with `?request_id=xxx` parameter
2. JavaScript calls `/api/prefill?request_id=xxx`
3. API returns this minimal payload
4. Page displays personalized greeting and form

### Form Submission
1. User fills form and clicks "Submit Renewal Request"
2. JavaScript POSTs to `/api/lead`
3. API returns order payload (separate specification)
4. Page redirects to `/renewal-landing/order.html` with order data

## Example API Response

### `/api/prefill?request_id=xxx`
```json
{
  "person": {
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.j@example.com",
    "mobile": "+44 7700 900123"
  },
  "organisation": {
    "name": "Tech Innovations Ltd",
    "company_number": "09876543"
  },
  "trademarks": [
    {
      "id": "tm_001",
      "word_mark": "TECHIFY",
      "mark_type": "Word Mark",
      "status": "Registered",
      "jurisdiction": "UK",
      "application_number": "UK00003456789",
      "registration_number": "UK00003456789",
      "registration_date": "2015-06-20",
      "expiry_date": "2025-06-20",
      "classes": [
        {"nice": "9", "description": "Software"},
        {"nice": "42", "description": "IT services"}
      ],
      "classes_count": 2
    },
    {
      "id": "tm_002",
      "word_mark": "INNOVATE PRO",
      "mark_type": "Logo",
      "status": "Registered",
      "jurisdiction": "UK",
      "application_number": "UK00003567890",
      "expiry_date": "2026-08-15",
      "classes_count": 3
    }
  ],
  "next_due": {
    "trademark_id": "tm_001",
    "expiry_date": "2025-06-20"
  },
  "prefill": {
    "contact": {
      "name": "Sarah Johnson",
      "email": "sarah.j@example.com",
      "mobile": "+44 7700 900123"
    },
    "trademark": {
      "id": "tm_001"
    },
    "authorisations": {
      "ownership_change": null,
      "classification_change": null,
      "authorized": true
    }
  },
  "links": {
    "book_call": "https://bookings.thetrademarkhelpline.com/#/4584810000004811044"
  },
  "security": {
    "request_id": "req_7a8b9c0d1e2f",
    "expires_at": "2025-05-20T23:59:59Z"
  }
}
```

## Validation Rules

1. **At least one trademark** must be provided in `trademarks[]`
2. **`next_due.trademark_id`** must match an ID in `trademarks[]`
3. **Email format** must be valid
4. **Phone number** should include country code
5. **Dates** should be in ISO 8601 format (YYYY-MM-DD)
6. **Expiry date** should be in the future (for active renewals)

## Error Handling

If required fields are missing:
- Page displays generic greeting without personalization
- Form fields remain empty
- Validation occurs on submission

## Testing

Use `minimal-payload-example.json` for testing:

```javascript
// In browser console or mock-data.js
window.__renewalPayload = {
  // paste minimal payload here
};
```

Or via URL parameter:
```
index.html?request_id=test123
```

With `/api/prefill` returning the minimal payload.
