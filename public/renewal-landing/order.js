/**
 * Order Page - Trademark Renewal Portal
 * Displays quote/order after form submission
 */

// Mock order data for development
// In production, this will come from API response payload
const MOCK_ORDER = {
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
  payment_url: 'https://checkout.stripe.com/...',
  booking_url: 'https://bookings.thetrademarkhelpline.com/#/4584810000004811044'
};

/**
 * Format currency (GBP)
 */
function formatCurrency(amount) {
  const formatted = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-£${formatted}` : `£${formatted}`;
}

/**
 * Populate trademark information
 */
function populateTrademarkInfo(trademark) {
  document.getElementById('word-mark').textContent = trademark.word_mark || '—';
  document.getElementById('app-number').textContent = trademark.application_number || '—';
  document.getElementById('mark-type').textContent = trademark.mark_type || '—';
  document.getElementById('class-count').textContent = trademark.class_count || '—';
}

/**
 * Populate order line items
 */
function populateOrderItems(lineItems) {
  const tbody = document.getElementById('invoice-items');
  tbody.innerHTML = '';

  lineItems.forEach(item => {
    const row = document.createElement('tr');
    if (item.is_discount) {
      row.classList.add('discount-row');
    }

    row.innerHTML = `
      <td class="item-col">${item.description}</td>
      <td class="qty-col">${item.quantity}</td>
      <td class="cost-col">${formatCurrency(item.total)}</td>
    `;

    tbody.appendChild(row);
  });
}

/**
 * Populate order totals
 */
function populateOrderTotals(order) {
  document.getElementById('subtotal').textContent = formatCurrency(order.subtotal);
  document.getElementById('vat').textContent = formatCurrency(order.vat_amount);
  document.getElementById('total').textContent = formatCurrency(order.total);
}

/**
 * Update payment button link
 */
function updatePaymentLink(paymentUrl) {
  const payNowBtn = document.getElementById('pay-now-btn');
  if (paymentUrl) {
    payNowBtn.href = paymentUrl;
  }
}

/**
 * Load order from URL parameters or localStorage
 */
function loadOrderData() {
  // Try to get order data from window.__orderPayload (set by mock-data.js)
  if (window.__orderPayload) {
    console.log('Using window.__orderPayload');
    return window.__orderPayload;
  }

  // Try to get order data from URL parameter (base64 encoded JSON)
  const urlParams = new URLSearchParams(window.location.search);
  const orderParam = urlParams.get('order');

  if (orderParam) {
    try {
      const orderData = JSON.parse(atob(orderParam));
      console.log('Using order data from URL parameter');
      return orderData;
    } catch (e) {
      console.error('Failed to parse order data from URL:', e);
    }
  }

  // Try to get order data from localStorage
  const storedOrder = localStorage.getItem('renewal_order');
  if (storedOrder) {
    try {
      console.log('Using order data from localStorage');
      return JSON.parse(storedOrder);
    } catch (e) {
      console.error('Failed to parse order data from storage:', e);
    }
  }

  // Fallback to mock data for development
  console.log('Using MOCK_ORDER fallback');
  return MOCK_ORDER;
}

/**
 * Save order data to localStorage
 */
function saveOrderData(orderData) {
  try {
    localStorage.setItem('renewal_order', JSON.stringify(orderData));
  } catch (e) {
    console.error('Failed to save order data:', e);
  }
}

/**
 * Initialize order page
 */
function initOrderPage() {
  const orderData = loadOrderData();

  // Populate all sections
  populateTrademarkInfo(orderData.trademark);
  populateOrderItems(orderData.line_items);
  populateOrderTotals(orderData);
  updatePaymentLink(orderData.payment_url);

  // Save to localStorage for reference
  saveOrderData(orderData);

  console.log('Order loaded:', orderData);
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOrderPage);
} else {
  initOrderPage();
}

/**
 * Helper function to create order URL with embedded data
 * Call this from the main form page when redirecting to order
 */
window.createOrderUrl = function(orderData) {
  const encodedData = btoa(JSON.stringify(orderData));
  return `order.html?order=${encodeURIComponent(encodedData)}`;
};
