# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a trademark renewal portal for The Trademark Helpline - a standalone landing page system that allows clients to review and renew their trademarks. The system consists of a static frontend that integrates with CRM (Zoho) via serverless API endpoints.

## Architecture

### Frontend Structure

The project is a **static HTML landing page** with vanilla JavaScript - no build system or framework:

- **`public/renewal-landing/`** - Complete self-contained landing page
  - `index.html` - Single-page responsive HTML with accessibility features
  - `styles.css` - CSS using custom properties (CSS variables) for theming
  - `main.js` - Client-side prefill logic, form validation, UTM tracking, and screening flow
  - `mock-data.js` - Mock CRM payload for local development (sets `window.__renewalPayload`)

### API Integration Pattern

The landing page expects two serverless endpoints:

1. **`GET /api/prefill?request_id=...`** - Fetches CRM data to prepopulate the form
   - Validates one-time request_id tokens
   - Returns person, organization, trademark, and renewal data
   - Example handler: `api/prefill.example.js`

2. **`POST /api/lead`** - Receives form submissions
   - Captures lead details + UTM context
   - Stores in CRM (Zoho custom object or Lead)
   - Example handler: `api/lead.example.js`

### Data Flow

```
CRM (Zoho) → /api/prefill?request_id=xxx → Landing Page Form → /api/lead → CRM (Zoho)
                                              ↓
                                      Screening Logic (client-side)
                                              ↓
                                   Payment URL or "Book a Call" prompt
```

### Key Frontend Features

- **Prefill Logic** (`main.js:198-213`): Fetches CRM data via `/api/prefill` or uses `window.__renewalPayload` for local testing
- **Dynamic Greeting**: Personalizes hero section with client name and trademark number
- **Renewals List**: Displays all client trademarks sorted by expiry date
- **Form Sync**: Live updates of summary card as user edits form fields
- **UTM Tracking**: Automatically captures all UTM parameters + referrer + landing path in hidden fields
- **Screening Flow** (`main.js:276-299`): Client-side decision logic that:
  - Checks if ownership or classification changes are needed
  - Requires authorization confirmation
  - Routes to payment URL if straightforward renewal
  - Prompts to book a call if changes are indicated

### CRM Data Model

The `/api/prefill` endpoint returns a structured payload (see `mock-data.js` for full schema):

```javascript
{
  person: { first_name, last_name, email, mobile, full_name },
  organisation: { name, company_number, address, website },
  trademarks: [{
    id, word_mark, mark_type, status, jurisdiction,
    application_number, registration_number,
    application_date, registration_date, expiry_date,
    classes: [{ nice, description }], classes_count
  }],
  next_due: { trademark_id, expiry_date },
  prefill: { contact, trademark, authorisations, changes_requested },
  links: { book_call, pay_now, manage_prefs }
}
```

## Development Workflow

### Local Development

1. Open `public/renewal-landing/index.html` directly in a browser, or serve with any static server:
   ```bash
   cd public/renewal-landing
   python3 -m http.server 8000
   # or
   npx serve .
   ```

2. Mock data is automatically loaded from `mock-data.js` via `window.__renewalPayload`

3. To test with URL parameters:
   ```
   ?firstName=John&email=test@example.com&request_id=test123
   ```

### Testing the API Integration

The serverless API handlers in `api/` are example stubs. To integrate:

1. Deploy to your serverless platform (Vercel, Netlify, Azure Functions, AWS Lambda)
2. Update form attributes in `index.html`:
   - `data-endpoint` - target for form submission (default: `/api/lead`)
   - `data-prefill-endpoint` - prefill data source (default: `/api/prefill`)
   - `data-payment-url` - redirect after successful screening (default: `/pay`)
3. Replace Zoho API calls in the example handlers with actual auth + API requests

### No Build System

This project intentionally has **no package.json, no bundler, no build step**. Changes to HTML/CSS/JS are immediately reflected when you refresh the browser.

## Design System

The CSS uses a custom property system defined in `:root` (see `styles.css:1-19`):

- **Brand colors**: `--brand-pink` (primary), `--brand-navy` (headings)
- **Typography**: Poppins (headings), Nunito Sans (body)
- **Layout**: Fluid responsive design with `clamp()` and CSS Grid
- **Components**: Cards, buttons, icon-cards, forms all use `--radius` and `--shadow` tokens

### Responsive Breakpoints

The layout adapts at:
- 1100px - Switches hero grid from 2-column to single column
- 768px - Stacks form layout and reduces icon-card grid
- Additional breakpoints defined in `styles.css:150+` (media queries)

## Important Patterns

### Name Handling

The `splitName()` function (`main.js:87-94`) handles person names that may come as:
- Separate `first_name` and `last_name` fields
- Combined `full_name` field
- Contact `name` field

The prefill logic prioritizes these in order and splits combined names intelligently.

### Trademark Selection Priority

When multiple trademarks exist, the primary trademark is selected based on (`main.js:149`):
1. The trademark matching `next_due.trademark_id`
2. The trademark in `prefill.trademark` if present
3. The first trademark in the `trademarks` array

### Security Notes

- Request IDs should be one-time use, signed tokens (see `security` object in mock data)
- Never commit `.env` files (already in `.gitignore`)
- Form submissions include UTM tracking - ensure this data is handled per privacy policy

## File Reference

- Landing page implementation: `public/renewal-landing/`
- API handler examples: `api/prefill.example.js`, `api/lead.example.js`
- Mock data schema: `public/renewal-landing/mock-data.js`
- Documentation: `public/renewal-landing/README.md`, `api/README.md`
