# Payload Structure Comparison

## Quick Summary of Changes

### URL Parameter
- **Old:** `?request_id=abc123`
- **New:** `?token=tok_abc123`

### Top-Level Keys
- **Old:** `person`, `organisation`, `trademarks[]`, `next_due`, `links`, `security`
- **New:** `account`, `contact`, `trademark`, `next_due[]`, `links`, `security`

---

## Side-by-Side Comparison

### Account Information

**OLD STRUCTURE:**
```json
{
  "person": {
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah@example.com",
    "mobile": "+44 7700 900123",
    "full_name": "Sarah Johnson"
  },
  "organisation": {
    "name": "Tech Innovations Ltd",
    "company_number": "09876543",
    "address": {
      "line1": "123 High Street",
      "city": "Manchester",
      "postcode": "M1 1AA",
      "country": "United Kingdom"
    },
    "website": "https://techinnovations.com"
  }
}
```

**NEW STRUCTURE:**
```json
{
  "account": {
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
  },
  "contact": {
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah@example.com",
    "mobile": "+44 7700 900123",
    "phone": "+44 161 123 4567",
    "position": "Managing Director"
  }
}
```

**Key Improvements:**
- ✅ Clear separation of account owner vs. contact person
- ✅ Account type explicitly defined (`"organization"` or `"individual"`)
- ✅ VAT number added for organizations
- ✅ Contact position/role added
- ✅ Separate mobile and phone fields

---

### Trademark Information

**OLD STRUCTURE:**
```json
{
  "trademarks": [
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
      "classes": [...],
      "classes_count": 2
    },
    {
      "id": "tm_002",
      ...
    }
  ],
  "next_due": {
    "trademark_id": "tm_001",
    "expiry_date": "2025-06-20"
  }
}
```

**NEW STRUCTURE:**
```json
{
  "trademark": {
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
    "classes": [...],
    "classes_count": 2,
    "proprietor": {
      "name": "Tech Innovations Ltd",
      "address": "123 High Street, Manchester, M1 1AA, UK"
    }
  },
  "next_due": [
    {
      "id": "tm_002",
      "word_mark": "INNOVATE PRO",
      "mark_type": "Logo",
      "image_url": "https://cdn.example.com/tm_002.png",
      ... (full trademark object)
    }
  ]
}
```

**Key Improvements:**
- ✅ Main trademark is singular (not array) - clearer intent
- ✅ `image_url` field for logo/device marks
- ✅ `proprietor` info shows registered owner
- ✅ `next_renewal_date` explicitly stated
- ✅ `next_due` is now array of full trademark objects (not just IDs)
- ✅ Other renewals have complete info for display

---

### Security

**OLD STRUCTURE:**
```json
{
  "security": {
    "request_id": "req_abc123xyz",
    "expires_at": "2025-03-01T23:59:59Z"
  }
}
```

**NEW STRUCTURE:**
```
No security object in JSON payload.
Token is in URL parameter: ?token=tok_abc123xyz
Backend handles all validation and expiration.
```

**Key Changes:**
- ✅ `request_id` → `token` (URL parameter only)
- ✅ Security details not exposed to frontend
- ✅ Token expires after form submission (backend)
- ✅ Cleaner payload structure

---

### Links

**OLD STRUCTURE:**
```json
{
  "links": {
    "book_call": "https://bookings.example.com/...",
    "pay_now": "https://payment.example.com/...",
    "manage_prefs": "#"
  }
}
```

**NEW STRUCTURE:**
```json
{
  "links": {
    "book_call": "https://bookings.example.com/...",
    "manage_prefs": "https://portal.example.com/preferences",
    "terms_conditions": "https://www.example.com/terms"
  }
}
```

**Key Improvements:**
- ✅ Removed `pay_now` (comes from order endpoint, not prefill)
- ✅ Added `terms_conditions` link for T&C checkbox

---

## What Frontend Needs to Change

### 1. URL Parameter
```javascript
// OLD
const requestId = new URLSearchParams(window.location.search).get('request_id');

// NEW
const token = new URLSearchParams(window.location.search).get('token');
```

### 2. API Call
```javascript
// OLD
fetch(`/api/prefill?request_id=${requestId}`)

// NEW
fetch(`/api/prefill?token=${token}`)
```

### 3. Data Access
```javascript
// OLD
data.person.first_name
data.organisation.name
data.trademarks[0].word_mark
const primaryTM = data.trademarks.find(tm => tm.id === data.next_due.trademark_id)

// NEW
data.contact.first_name
data.account.name
data.trademark.word_mark  // Direct access
// next_due is array of OTHER trademarks
data.next_due.forEach(tm => { ... })
```

### 4. Account Type Handling
```javascript
// NEW
if (data.account.type === 'organization') {
  accountName = data.account.name;  // Company name
  showCompanyNumber = true;
} else {
  accountName = data.account.name;  // Person's full name
  showCompanyNumber = false;
}
```

### 5. Trademark Image Display
```javascript
// NEW
if (data.trademark.image_url) {
  // Display as image
  img.src = data.trademark.image_url;
} else {
  // Display as text
  element.textContent = data.trademark.word_mark;
}
```

---

## Benefits of New Structure

1. **Clearer Separation of Concerns**
   - Account owner vs. contact person
   - Primary trademark vs. upcoming renewals

2. **Better Support for Multiple Scenarios**
   - Individual vs. organization accounts
   - Logo/image trademarks via URL

3. **More Explicit**
   - Token vs. request_id
   - One-time use flag
   - Account type field

4. **Easier to Work With**
   - Direct access to primary trademark
   - No need to search array for "the one"
   - Full objects in next_due (no separate lookups)

5. **Future-Proof**
   - Proprietor info separate from account (for ownership transfers)
   - Image URL supports different mark types
   - Extensible account types

---

## Token Security Implementation

### Backend Requirements

**Token expiration strategy:**
- Token is valid from creation until form submission
- After form submission (POST /api/lead), mark token as "used"
- Subsequent attempts to use the same token should be rejected
- Optional: Also enforce time-based expiration (e.g., 90 days)

**Backend pseudo-code:**
```python
# On page load
def prefill(token):
    token_record = validate_token(token)  # Check exists, not expired, not used
    return get_renewal_data(token_record.client_id)

# On form submission
def create_lead(token, form_data):
    token_record = validate_token(token)  # Check again
    lead = process_renewal(token_record, form_data)
    token_record.mark_as_used()  # Expire the token
    return get_order_details(lead)
```

---

## Implementation Checklist

- [ ] Update URL parameter from `request_id` to `token`
- [ ] Update API endpoint to accept `token` parameter
- [ ] Implement token expiration on form submission (backend)
- [ ] Refactor data structure mapping:
  - [ ] `person` + `organisation` → `account` + `contact`
  - [ ] `trademarks[]` → `trademark`
  - [ ] `next_due.trademark_id` → `next_due[]`
- [ ] Add account type handling logic
- [ ] Add trademark image display logic
- [ ] Update form prefill logic
- [ ] Update greeting/personalization logic
- [ ] Update renewals list display
- [ ] Add proprietor info display (if needed)
- [ ] Update Terms & Conditions link
- [ ] Test with both organization and individual payloads
- [ ] Test with both word marks and logo marks
