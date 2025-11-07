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
  const numeric = Number(amount);
  if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
    return '£0.00';
  }
  const formatted = Math.abs(numeric).toFixed(2);
  return numeric < 0 ? `-£${formatted}` : `£${formatted}`;
}

/**
 * Populate trademark information
 */
function populateTrademarkInfo(trademark) {
  const info = trademark || {};
  document.getElementById('word-mark').textContent = info.word_mark || info.name || '—';
  document.getElementById('app-number').textContent = info.application_number || info.registration_number || info.id || '—';
  document.getElementById('mark-type').textContent = info.mark_type || info.type || '—';
  const classes = info.class_count ?? info.classes_count;
  document.getElementById('class-count').textContent = classes != null ? classes : '—';
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

    const itemName = item.description || item.name || item.sku || '—';
    const quantity = item.quantity != null ? item.quantity : 1;
    const amount = item.total != null ? item.total : item.unit_price;

    row.innerHTML = `
      <td class="item-col">${itemName}</td>
      <td class="qty-col">${quantity}</td>
      <td class="cost-col">${formatCurrency(amount)}</td>
    `;

    tbody.appendChild(row);
  });
}

/**
 * Populate order totals
 */
function populateOrderTotals(order) {
  const subtotal = order.subtotal ?? order.sub_total ?? 0;
  const vat = order.vat_amount ?? order.vat ?? order.tax ?? 0;
  const total = order.total ?? order.grand_total ?? (Number(subtotal) + Number(vat));

  document.getElementById('subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('vat').textContent = formatCurrency(vat);
  document.getElementById('total').textContent = formatCurrency(total);
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
function base64EncodeJson(value) {
  const json = JSON.stringify(value);
  return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}

function base64DecodeJson(value) {
  try {
    const binary = atob(value);
    const percentEncoded = Array.from(binary)
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('');
    const json = decodeURIComponent(percentEncoded);
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decode order data', error);
    throw error;
  }
}

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
      const orderData = base64DecodeJson(orderParam);
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

/**
 * Handle terms and conditions validation
 */
function initTermsValidation() {
  const payNowBtn = document.getElementById('pay-now-btn');
  const termsCheckbox = document.getElementById('terms-checkbox');
  const termsError = document.getElementById('terms-error');

  if (payNowBtn && termsCheckbox) {
    payNowBtn.addEventListener('click', function(e) {
      if (!termsCheckbox.checked) {
        e.preventDefault();
        termsError.style.display = 'block';
        termsCheckbox.focus();

        // Scroll to terms section
        const termsSection = document.querySelector('.terms-section');
        if (termsSection) {
          termsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        termsError.style.display = 'none';

        // Add loading spinner to Pay Now button
        payNowBtn.classList.add('btn-loading');
        const originalHTML = payNowBtn.innerHTML;
        payNowBtn.innerHTML = '<span><span class="spinner"></span>Redirecting to payment...</span>';

        // Note: Navigation will happen naturally via href
        // Spinner stays visible during redirect
      }
    });

    // Hide error when checkbox is checked
    termsCheckbox.addEventListener('change', function() {
      if (termsCheckbox.checked) {
        termsError.style.display = 'none';
      }
    });
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initOrderPage();
    initTermsValidation();
  });
} else {
  initOrderPage();
  initTermsValidation();
}

/**
 * Helper function to create order URL with embedded data
 * Call this from the main form page when redirecting to order
 */
window.createOrderUrl = function(orderData) {
  const encodedData = base64EncodeJson(orderData);
  return `/renewal-landing/order.html?order=${encodeURIComponent(encodedData)}`;
};
