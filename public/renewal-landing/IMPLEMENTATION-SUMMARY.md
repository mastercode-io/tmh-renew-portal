# Revised Payload Structure - Implementation Summary

## Overview

This document summarizes the changes made to implement the revised JSON payload structure for the trademark renewal landing page.

## Key Changes

### 1. URL Parameter Change
- **OLD:** `?request_id=abc123`
- **NEW:** `?token=tok_abc123`

**Files modified:**
- `main.js` (line 122): Changed `params.get('request_id')` to `params.get('token')`
- `main.js` (line 268): Updated API call to use `token` parameter

### 2. Payload Structure Changes

#### OLD Structure:
```javascript
{
  person: { first_name, last_name, email, mobile },
  organisation: { name, company_number, address },
  trademarks: [ {...}, {...} ],  // Array
  next_due: { trademark_id: "tm_001" }
}
```

#### NEW Structure:
```javascript
{
  account: { type, name, address },  // Unified account object
  contact: { first_name, last_name, email, mobile },
  trademark: { ... },  // Singular object
  next_due: [ {...}, {...} ],  // Array of full objects
  links: { book_call, manage_prefs, terms_conditions }
}
```

### 3. JavaScript Changes (`main.js`)

#### applyPrefillPayload Function (lines 171-281)
**Complete refactor to handle new structure:**

- Removed references to `payload.person` and `payload.organisation`
- Added support for `payload.account` and `payload.contact`
- Changed from `payload.trademarks[]` to `payload.trademark` (singular)
- Updated `next_due` handling from ID reference to full object array
- Added trademark image display logic (lines 238-247)
- Added support for `terms_conditions` and `manage_prefs` links (lines 267-280)

**Key logic changes:**
```javascript
// OLD
const person = payload.person || {};
const org = payload.organisation || {};
const allMarks = Array.isArray(payload.trademarks) ? payload.trademarks : [];
const primaryTrademark = allMarks.find(tm => tm.id === payload.next_due?.trademark_id);

// NEW
const account = payload.account || {};
const contact = payload.contact || {};
const trademark = payload.trademark || {};
const nextDue = Array.isArray(payload.next_due) ? payload.next_due : [];
const allMarks = [trademark, ...nextDue].filter(Boolean);
```

### 4. HTML Changes (`index.html`)

#### Added Trademark Image Container (lines 363-366)
```html
<div id="trademark-image-container" style="display: none;">
  <dt>Trademark image</dt>
  <dd><img id="trademark-image" src="" alt="Trademark logo"
       style="max-width: 200px; max-height: 100px; display: block;" /></dd>
</div>
```

This container is dynamically shown when `trademark.image_url` is present.

### 5. Mock Data Files Updated

#### `mock-data.js`
- Completely rewritten to use new structure
- Uses organization account type
- Includes 3 trademarks (1 primary + 2 in next_due)
- Added `terms_conditions` link

#### `mock-data-individual.js` (NEW)
- Created for testing individual account type
- Uses individual payload structure
- Includes trademark with image_url

#### `absolute-minimal-payload.json`
- Updated to minimal required fields
- Uses new structure
- Individual account type with single trademark

### 6. New Test Page

#### `index-individual.html` (NEW)
- Clone of main page for testing individual payload
- Loads `mock-data-individual.js` instead of `mock-data.js`
- Allows testing both organization and individual scenarios

## Features Added

### 1. Trademark Image Support
- Automatically displays trademark logo/image when `image_url` is provided
- Hidden for word marks (when `image_url` is `null`)
- Located in "Review your information" section

### 2. Account Type Handling
- Supports both `"organization"` and `"individual"` account types
- `account.name` displays company name for organizations
- `account.name` displays full legal name for individuals
- Future-proof for different account scenarios

### 3. Enhanced Links Support
- `book_call` - Booking consultation link
- `manage_prefs` - Communication preferences link
- `terms_conditions` - Terms & Conditions link (NEW)
- All links use `data-link` attributes for easy updating

### 4. Improved Renewals List
- Now includes the primary trademark being renewed
- Next due trademarks have full information (no separate lookups needed)
- Sorted by expiry date with clear expiry/expired labels

## Backend Requirements

### API Endpoint Changes

#### GET /api/prefill
**OLD:** `GET /api/prefill?request_id=abc123`
**NEW:** `GET /api/prefill?token=tok_abc123`

**Response format:** See `revised-payload-structure.json` or `revised-payload-individual.json`

### Token Security
- Token passed via URL parameter only (not in response payload)
- Backend validates token on each request
- Token marked as "used" after form submission
- Prevents reuse and unauthorized access

## Testing

### Organization Account
```bash
# Open default page (loads mock-data.js)
open index.html
# or
open http://localhost:8000/index.html
```

### Individual Account
```bash
# Open individual test page (loads mock-data-individual.js)
open index-individual.html
# or
open http://localhost:8000/index-individual.html
```

### With Live Token
```bash
# Organization
open index.html?token=tok_org_12345

# Individual
open index.html?token=tok_ind_67890
```

## Migration Checklist for Backend

- [ ] Update API endpoint to accept `token` instead of `request_id`
- [ ] Implement token validation on GET /api/prefill
- [ ] Implement token expiration after POST /api/lead
- [ ] Update payload structure:
  - [ ] Map person + organisation → account + contact
  - [ ] Identify primary trademark and return as singular object
  - [ ] Return other renewals in next_due array (not IDs, full objects)
  - [ ] Add account.type field ("organization" or "individual")
  - [ ] Add trademark.image_url for logo marks
  - [ ] Add trademark.proprietor info
  - [ ] Remove security object from response
- [ ] Test with both organization and individual payloads
- [ ] Test trademark image URLs (ensure CORS-enabled)

## Files Modified

1. `main.js` - Complete refactor of payload handling
2. `index.html` - Added trademark image container
3. `mock-data.js` - Rewritten to new structure
4. `absolute-minimal-payload.json` - Updated to new structure

## Files Created

1. `mock-data-individual.js` - Individual account mock data
2. `index-individual.html` - Test page for individual accounts
3. `IMPLEMENTATION-SUMMARY.md` - This document

## Documentation Reference

- `REVISED-PAYLOAD-SPEC.md` - Complete API specification
- `PAYLOAD-COMPARISON.md` - Old vs new comparison with migration guide
- `revised-payload-structure.json` - Organization example
- `revised-payload-individual.json` - Individual example

## Backwards Compatibility

**BREAKING CHANGES:** This update is NOT backwards compatible with the old payload structure.

If you need to support both old and new payloads temporarily:
1. Keep old code in a separate branch
2. Check for `payload.account` to detect new structure
3. Add fallback logic to handle old structure

Example:
```javascript
function applyPrefillPayload(payload) {
  if (payload.account) {
    // NEW structure
    applyNewPayload(payload);
  } else if (payload.person) {
    // OLD structure (fallback)
    applyOldPayload(payload);
  }
}
```

## Benefits of New Structure

1. **Clearer Separation** - Account owner vs. contact person
2. **Better UX** - Direct access to primary trademark (no array searching)
3. **More Flexible** - Supports both individual and organization accounts
4. **Image Support** - Native support for logo/device marks
5. **Complete Data** - next_due contains full objects (no separate lookups)
6. **Enhanced Security** - Token validation backend-only
7. **Future-Proof** - Extensible for new account types and features

## Questions or Issues?

Refer to the comprehensive specification in `REVISED-PAYLOAD-SPEC.md` for detailed field descriptions, validation rules, and examples.
