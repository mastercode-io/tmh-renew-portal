/**
 * Mock order data for testing
 * Loads only for localhost or when ?mock=1 to avoid production overrides.
 */

(function initOrderMocks() {
  if (!shouldInjectMockData()) {
    console.log('ℹ️ Order mock data skipped (production context)');
    return;
  }

  const defaultOrder = {
    trademark: {
      word_mark: 'EXAMPLE BRAND',
      application_number: 'UK00003123456',
      mark_type: 'Word Mark',
      class_count: 2
    },
    line_items: [
      { description: 'IPO Renewal Fees', quantity: 1, unit_price: 200.0, total: 200.0 },
      { description: 'Additional Classes', quantity: 1, unit_price: 50.0, total: 50.0 },
      { description: 'Administration Fee', quantity: 1, unit_price: 222.0, total: 222.0 },
      {
        description: 'Online Discount',
        quantity: 1,
        unit_price: -120.0,
        total: -120.0,
        is_discount: true
      }
    ],
    subtotal: 352.0,
    vat_rate: 0.2,
    vat_amount: 70.4,
    total: 422.4,
    payment_url: 'https://checkout.stripe.com/test-session',
    booking_url: 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044'
  };

  const singleClassOrder = {
    trademark: {
      word_mark: 'SIMPLE MARK',
      application_number: 'UK00003987654',
      mark_type: 'Word Mark',
      class_count: 1
    },
    line_items: [
      { description: 'IPO Renewal Fees', quantity: 1, unit_price: 200.0, total: 200.0 },
      { description: 'Administration Fee', quantity: 1, unit_price: 222.0, total: 222.0 },
      {
        description: 'Online Discount',
        quantity: 1,
        unit_price: -120.0,
        total: -120.0,
        is_discount: true
      }
    ],
    subtotal: 302.0,
    vat_rate: 0.2,
    vat_amount: 60.4,
    total: 362.4,
    payment_url: 'https://checkout.stripe.com/test-session',
    booking_url: 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044'
  };

  const multiClassOrder = {
    trademark: {
      word_mark: 'PREMIUM BRAND™',
      application_number: 'UK00003555123',
      mark_type: 'Series Mark',
      class_count: 5
    },
    line_items: [
      { description: 'IPO Renewal Fees', quantity: 1, unit_price: 200.0, total: 200.0 },
      { description: 'Additional Classes', quantity: 4, unit_price: 50.0, total: 200.0 },
      { description: 'Administration Fee', quantity: 1, unit_price: 350.0, total: 350.0 },
      {
        description: 'Online Discount',
        quantity: 1,
        unit_price: -120.0,
        total: -120.0,
        is_discount: true
      }
    ],
    subtotal: 630.0,
    vat_rate: 0.2,
    vat_amount: 126.0,
    total: 756.0,
    payment_url: 'https://checkout.stripe.com/test-session',
    booking_url: 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044'
  };

  window.__orderPayload = defaultOrder;
  window.__orderPayload_SingleClass = singleClassOrder;
  window.__orderPayload_MultiClass = multiClassOrder;

  console.log('📋 Order mock data loaded');
  console.log('Available test scenarios:');
  console.log('  - window.__orderPayload (default: 2 classes)');
  console.log('  - window.__orderPayload_SingleClass (1 class)');
  console.log('  - window.__orderPayload_MultiClass (5 classes)');
})();

function shouldInjectMockData() {
  if (typeof window === 'undefined') return false;
  const search = window.location.search || '';
  if (search.includes('mock=1')) return true;
  const host = window.location.hostname;
  if (!host) return true;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  return window.location.protocol === 'file:';
}
