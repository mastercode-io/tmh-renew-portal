/**
 * Invoice Page - Trademark Renewal Portal
 * Displays quote/invoice after form submission
 */

// Mock invoice data for development
// In production, this will come from API response payload
const MOCK_INVOICE = {
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
 * Populate invoice line items
 */
function populateInvoiceItems(lineItems) {
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
 * Populate invoice totals
 */
function populateInvoiceTotals(invoice) {
  document.getElementById('subtotal').textContent = formatCurrency(invoice.subtotal);
  document.getElementById('vat').textContent = formatCurrency(invoice.vat_amount);
  document.getElementById('total').textContent = formatCurrency(invoice.total);
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
 * Load invoice from URL parameters or localStorage
 */
function loadInvoiceData() {
  // Try to get invoice data from window.__invoicePayload (set by mock-data.js)
  if (window.__invoicePayload) {
    console.log('Using window.__invoicePayload');
    return window.__invoicePayload;
  }

  // Try to get invoice data from URL parameter (base64 encoded JSON)
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceParam = urlParams.get('invoice');

  if (invoiceParam) {
    try {
      const invoiceData = JSON.parse(atob(invoiceParam));
      console.log('Using invoice data from URL parameter');
      return invoiceData;
    } catch (e) {
      console.error('Failed to parse invoice data from URL:', e);
    }
  }

  // Try to get invoice data from localStorage
  const storedInvoice = localStorage.getItem('renewal_invoice');
  if (storedInvoice) {
    try {
      console.log('Using invoice data from localStorage');
      return JSON.parse(storedInvoice);
    } catch (e) {
      console.error('Failed to parse invoice data from storage:', e);
    }
  }

  // Fallback to mock data for development
  console.log('Using MOCK_INVOICE fallback');
  return MOCK_INVOICE;
}

/**
 * Save invoice data to localStorage
 */
function saveInvoiceData(invoiceData) {
  try {
    localStorage.setItem('renewal_invoice', JSON.stringify(invoiceData));
  } catch (e) {
    console.error('Failed to save invoice data:', e);
  }
}

/**
 * Initialize invoice page
 */
function initInvoicePage() {
  const invoiceData = loadInvoiceData();

  // Populate all sections
  populateTrademarkInfo(invoiceData.trademark);
  populateInvoiceItems(invoiceData.line_items);
  populateInvoiceTotals(invoiceData);
  updatePaymentLink(invoiceData.payment_url);

  // Save to localStorage for reference
  saveInvoiceData(invoiceData);

  console.log('Invoice loaded:', invoiceData);
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInvoicePage);
} else {
  initInvoicePage();
}

/**
 * Helper function to create invoice URL with embedded data
 * Call this from the main form page when redirecting to invoice
 */
window.createInvoiceUrl = function(invoiceData) {
  const encodedData = btoa(JSON.stringify(invoiceData));
  return `invoice.html?invoice=${encodeURIComponent(encodedData)}`;
};
