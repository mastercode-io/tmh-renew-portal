# Invoice Page Documentation

## Overview

The invoice page displays a clean, professional quote/invoice after a user submits their trademark renewal request. It shows:

- Trademark details (word mark, application number, mark type, class count)
- Itemized cost breakdown
- Subtotal, VAT, and total payable
- Upsell option for monitoring services
- Payment and booking CTAs

## Files

- `invoice.html` - Invoice page markup
- `invoice-styles.css` - Styles matching the main landing page design system
- `invoice.js` - Client-side logic to populate invoice from API response
- `invoice-mock-data.js` - Mock data for local testing

## Design

The invoice page follows the same design system as the main renewal landing page:

- **Colors**: Brand pink (#E51652), brand navy (#223447), matching the landing page
- **Typography**: Poppins for headings, Nunito Sans for body text
- **Layout**: Centered 800px max-width container with card-based design
- **Responsive**: Mobile-friendly with stacked layout on small screens

## Data Flow

### Production Flow

1. User submits renewal form on `index.html`
2. Form POST to `/api/lead` returns invoice payload in response
3. Response includes:
   ```json
   {
     "trademark": {
       "word_mark": "BRAND NAME",
       "application_number": "UK00003123456",
       "mark_type": "Word Mark",
       "class_count": 2
     },
     "line_items": [
       {
         "description": "IPO Renewal Fees",
         "quantity": 1,
         "unit_price": 200.00,
         "total": 200.00
       },
       {
         "description": "Additional Classes",
         "quantity": 1,
         "unit_price": 50.00,
         "total": 50.00
       },
       {
         "description": "Administration Fee",
         "quantity": 1,
         "unit_price": 222.00,
         "total": 222.00
       },
       {
         "description": "Online Discount",
         "quantity": 1,
         "unit_price": -120.00,
         "total": -120.00,
         "is_discount": true
       }
     ],
     "subtotal": 352.00,
     "vat_rate": 0.20,
     "vat_amount": 70.40,
     "total": 422.40,
     "payment_url": "https://checkout.stripe.com/...",
     "booking_url": "https://bookings.thetrademarkhelpline.com/#/..."
   }
   ```
4. Client-side JavaScript redirects to invoice page with data
5. Invoice page displays quote and payment options

### Data Loading Priority

The `invoice.js` script loads invoice data in this order:

1. **window.__invoicePayload** - Set by `invoice-mock-data.js` for local testing
2. **URL parameter** - Base64 encoded JSON in `?invoice=...` query param
3. **localStorage** - Previously saved invoice data (fallback)
4. **MOCK_INVOICE** - Hardcoded fallback for development

## Local Testing

### Option 1: Using Mock Data File

Add the mock data script to `invoice.html` before `invoice.js`:

```html
<script src="invoice-mock-data.js"></script>
<script src="invoice.js"></script>
```

Then open `invoice.html` in your browser. The page will use `window.__invoicePayload`.

To test different scenarios, modify `invoice-mock-data.js` or set a different payload:

```javascript
// In browser console:
window.__invoicePayload = window.__invoicePayload_MultiClass;
location.reload();
```

### Option 2: Using URL Parameter

Create an invoice URL with embedded data:

```javascript
const invoiceData = { /* your invoice object */ };
const url = window.createInvoiceUrl(invoiceData);
window.location.href = url;
```

### Option 3: Direct File Open

Simply open `invoice.html` - it will fall back to the built-in `MOCK_INVOICE`.

## Integration with Main Form

When the renewal form is submitted and returns an invoice payload:

```javascript
// In main.js after form submission success
const response = await fetch('/api/lead', {
  method: 'POST',
  body: formData
});

const invoiceData = await response.json();

// Method 1: URL parameter (recommended)
const invoiceUrl = window.createInvoiceUrl(invoiceData);
window.location.href = invoiceUrl;

// Method 2: localStorage + redirect
localStorage.setItem('renewal_invoice', JSON.stringify(invoiceData));
window.location.href = 'invoice.html';
```

## Customization

### Changing VAT Rate

VAT is calculated server-side and included in the response payload. The invoice page simply displays the `vat_amount` from the payload.

### Adding/Removing Line Items

Line items are dynamically generated from the `line_items` array in the payload. Simply add or remove items in the API response.

### Discount Styling

Items with `is_discount: true` are styled in pink to highlight savings:

```javascript
{
  "description": "Online Discount",
  "quantity": 1,
  "unit_price": -120.00,
  "total": -120.00,
  "is_discount": true  // Triggers pink styling
}
```

## Payment Flow

1. User clicks "No - I want to pay now"
2. Redirects to Stripe checkout URL from `payment_url` in payload
3. After payment completion, Stripe redirects to success page
4. Success page confirms renewal and next steps

## Booking Flow

1. User clicks "Yes - Book a Call"
2. Redirects to booking system (currently: Zoho Bookings)
3. User schedules consultation about monitoring services
4. Payment deferred until after consultation

## Mobile Responsive

- Tables are horizontally scrollable on small screens
- Action buttons stack vertically below 768px
- Text sizes scale with viewport using `clamp()`
- Touch-friendly tap targets (44px minimum)

## Accessibility

- Semantic HTML table structure with proper `<thead>`, `<tbody>`, `<tfoot>`
- High contrast colors (4.5:1 minimum ratio)
- Clear focus indicators
- Skip link for keyboard navigation
- Screen reader friendly labels

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+
- Android Chrome 80+
- No IE11 support (uses modern CSS features)
