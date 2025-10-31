/**
 * Mock invoice data for testing
 * To use: add <script src="invoice-mock-data.js"></script> before invoice.js
 */

// Example 1: Standard 2-class renewal with discount
window.__invoicePayload = {
  trademark: {
    word_mark: 'EXAMPLE BRAND',
    application_number: 'UK00003123456',
    mark_type: 'Word Mark',
    class_count: 2
  },
  line_items: [
    {
      description: 'IPO Renewal Fees',
      quantity: 1,
      unit_price: 200.00,
      total: 200.00
    },
    {
      description: 'Additional Classes',
      quantity: 1,
      unit_price: 50.00,
      total: 50.00
    },
    {
      description: 'Administration Fee',
      quantity: 1,
      unit_price: 222.00,
      total: 222.00
    },
    {
      description: 'Online Discount',
      quantity: 1,
      unit_price: -120.00,
      total: -120.00,
      is_discount: true
    }
  ],
  subtotal: 352.00,
  vat_rate: 0.20,
  vat_amount: 70.40,
  total: 422.40,
  payment_url: 'https://checkout.stripe.com/test-session',
  booking_url: 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044'
};

// Example 2: Single class renewal (cheaper)
window.__invoicePayload_SingleClass = {
  trademark: {
    word_mark: 'SIMPLE MARK',
    application_number: 'UK00003987654',
    mark_type: 'Word Mark',
    class_count: 1
  },
  line_items: [
    {
      description: 'IPO Renewal Fees',
      quantity: 1,
      unit_price: 200.00,
      total: 200.00
    },
    {
      description: 'Administration Fee',
      quantity: 1,
      unit_price: 222.00,
      total: 222.00
    },
    {
      description: 'Online Discount',
      quantity: 1,
      unit_price: -120.00,
      total: -120.00,
      is_discount: true
    }
  ],
  subtotal: 302.00,
  vat_rate: 0.20,
  vat_amount: 60.40,
  total: 362.40,
  payment_url: 'https://checkout.stripe.com/test-session',
  booking_url: 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044'
};

// Example 3: Multi-class renewal (5 classes)
window.__invoicePayload_MultiClass = {
  trademark: {
    word_mark: 'PREMIUM BRAND™',
    application_number: 'UK00003555123',
    mark_type: 'Series Mark',
    class_count: 5
  },
  line_items: [
    {
      description: 'IPO Renewal Fees',
      quantity: 1,
      unit_price: 200.00,
      total: 200.00
    },
    {
      description: 'Additional Classes',
      quantity: 4,
      unit_price: 50.00,
      total: 200.00
    },
    {
      description: 'Administration Fee',
      quantity: 1,
      unit_price: 350.00,
      total: 350.00
    },
    {
      description: 'Online Discount',
      quantity: 1,
      unit_price: -120.00,
      total: -120.00,
      is_discount: true
    }
  ],
  subtotal: 630.00,
  vat_rate: 0.20,
  vat_amount: 126.00,
  total: 756.00,
  payment_url: 'https://checkout.stripe.com/test-session',
  booking_url: 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044'
};

console.log('📋 Invoice mock data loaded');
console.log('Available test scenarios:');
console.log('  - window.__invoicePayload (default: 2 classes)');
console.log('  - window.__invoicePayload_SingleClass (1 class)');
console.log('  - window.__invoicePayload_MultiClass (5 classes)');
