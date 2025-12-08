/**
 * Audit Summary Page
 * Displays order summary and handles payment
 */

let currentOrder = null;

document.addEventListener('DOMContentLoaded', () => {
  initSummaryPage();
});

async function initSummaryPage() {
  // Get orderId from URL
  const orderId = getOrderIdFromUrl();

  if (!orderId) {
    showError('No order ID found. Please start from the beginning.');
    return;
  }

  // Load order data
  await loadOrderData(orderId);

  // Setup event listeners
  setupEventListeners();

  // Initial pricing calculation
  updatePricing();
}

/**
 * Get order ID from URL query parameter
 */
function getOrderIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('orderId');
}

/**
 * Load order data from API
 */
async function loadOrderData(orderId) {
  showLoading();

  try {
    const response = await fetch(`/api/audit/order/${orderId}`);

    if (!response.ok) {
      throw new Error('Failed to load order');
    }

    currentOrder = await response.json();

    // Display order summary
    renderOrderSummary(currentOrder);

    hideLoading();
  } catch (error) {
    console.error('Failed to load order:', error);
    hideLoading();
    showError('Failed to load your order. Please try again or contact support.');
  }
}

/**
 * Render order summary
 */
function renderOrderSummary(order) {
  const container = document.getElementById('summary-container');
  if (!container) return;

  const sections = order.sections || {};

  let html = '';

  // Contact Information
  if (sections.contact) {
    html += `
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--brand-navy); margin-bottom: 1rem; border-bottom: 2px solid var(--soft); padding-bottom: 0.5rem;">Contact Information</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
          <div><strong style="color: var(--brand-navy);">Name:</strong> ${sections.contact.firstName} ${sections.contact.lastName}</div>
          <div><strong style="color: var(--brand-navy);">Email:</strong> ${sections.contact.email}</div>
          <div><strong style="color: var(--brand-navy);">Phone:</strong> ${sections.contact.phone}</div>
          ${sections.preferences?.methods ? `<div><strong style="color: var(--brand-navy);">Preferred Contact:</strong> ${sections.preferences.methods.join(', ')}</div>` : ''}
        </div>
      </div>
    `;
  }

  // Trademark Information
  if (sections.tmInfo) {
    html += `
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--brand-navy); margin-bottom: 1rem; border-bottom: 2px solid var(--soft); padding-bottom: 0.5rem;">Trademark Information</h3>
        <div style="display: grid; gap: 1rem;">
          ${sections.tmStatus?.status ? `<div><strong style="color: var(--brand-navy);">Status:</strong> ${sections.tmStatus.status === 'existing' ? 'Existing Trademark – Registered' : 'New Application – Unregistered'}</div>` : ''}
          ${sections.tmInfo.name ? `<div><strong style="color: var(--brand-navy);">Trademark Name:</strong> ${sections.tmInfo.name}</div>` : ''}
          ${sections.tmInfo.types?.length ? `<div><strong style="color: var(--brand-navy);">Type:</strong> ${sections.tmInfo.types.join(', ')}</div>` : ''}
          ${sections.tmInfo.jurisdictions?.length ? `<div><strong style="color: var(--brand-navy);">Jurisdictions:</strong> ${sections.tmInfo.jurisdictions.join(', ')}</div>` : ''}
          ${sections.goods?.description ? `<div><strong style="color: var(--brand-navy);">Business Description:</strong> ${sections.goods.description}</div>` : ''}
          ${sections.goods?.website ? `<div><strong style="color: var(--brand-navy);">Website:</strong> <a href="${sections.goods.website}" target="_blank" style="color: var(--brand-pink); text-decoration: none;">${sections.goods.website}</a></div>` : ''}
        </div>
      </div>
    `;
  }

  // Billing Information
  if (sections.billing) {
    html += `
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--brand-navy); margin-bottom: 1rem; border-bottom: 2px solid var(--soft); padding-bottom: 0.5rem;">Billing Information</h3>
        <div style="display: grid; gap: 1rem;">
          <div><strong style="color: var(--brand-navy);">Type:</strong> ${sections.billing.type}</div>
          <div><strong style="color: var(--brand-navy);">Name:</strong> ${sections.billing.name}</div>
          ${sections.billing.address ? `
            <div>
              <strong style="color: var(--brand-navy);">Address:</strong><br />
              ${sections.billing.address.line1}<br />
              ${sections.billing.address.line2 ? sections.billing.address.line2 + '<br />' : ''}
              ${sections.billing.address.city}, ${sections.billing.address.county ? sections.billing.address.county + ', ' : ''}${sections.billing.address.postcode}<br />
              ${sections.billing.address.country}
            </div>
          ` : ''}
          <div><strong style="color: var(--brand-navy);">Invoice Email:</strong> ${sections.billing.invoiceEmail}</div>
          <div><strong style="color: var(--brand-navy);">Invoice Phone:</strong> ${sections.billing.invoicePhone}</div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const socialAddon = document.getElementById('social-addon');
  const payNowBtn = document.getElementById('pay-now-btn');

  if (socialAddon) {
    socialAddon.addEventListener('change', updatePricing);
  }

  if (payNowBtn) {
    payNowBtn.addEventListener('click', handlePayNow);
  }
}

/**
 * Update pricing display
 */
function updatePricing() {
  const socialAddon = document.getElementById('social-addon');
  const isSocialSelected = socialAddon ? socialAddon.checked : false;

  // Pricing calculation
  const baseAudit = 99.00;
  const socialAddonPrice = 10.00;
  const onlineDiscount = -40.00;

  const subtotal = baseAudit + (isSocialSelected ? socialAddonPrice : 0) + onlineDiscount;
  const vat = subtotal * 0.20;
  const total = subtotal + vat;

  // Render pricing table
  const pricingTable = document.getElementById('pricing-table');
  if (!pricingTable) return;

  let html = `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 0.75rem 0; color: var(--ink);">Trademark Audit</td>
      <td style="padding: 0.75rem 0; text-align: right; color: var(--ink);">£${baseAudit.toFixed(2)}</td>
    </tr>
  `;

  if (isSocialSelected) {
    html += `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 0.75rem 0; color: var(--ink);">Social Media Audit</td>
        <td style="padding: 0.75rem 0; text-align: right; color: var(--ink);">£${socialAddonPrice.toFixed(2)}</td>
      </tr>
    `;
  }

  html += `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 0.75rem 0; color: var(--brand-pink); font-weight: 600;">Online Audit Discount</td>
      <td style="padding: 0.75rem 0; text-align: right; color: var(--brand-pink); font-weight: 600;">£${onlineDiscount.toFixed(2)}</td>
    </tr>
    <tr style="border-bottom: 2px solid var(--brand-navy);">
      <td style="padding: 0.75rem 0; color: var(--ink); font-weight: 600;">Net Fees</td>
      <td style="padding: 0.75rem 0; text-align: right; color: var(--ink); font-weight: 600;">£${subtotal.toFixed(2)}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 0.75rem 0; color: var(--ink);">VAT (20%)</td>
      <td style="padding: 0.75rem 0; text-align: right; color: var(--ink);">£${vat.toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding: 1rem 0 0 0; color: var(--brand-navy); font-size: 1.25rem; font-weight: 700;">Total Amount to Pay</td>
      <td style="padding: 1rem 0 0 0; text-align: right; color: var(--brand-pink); font-size: 1.5rem; font-weight: 700;">£${total.toFixed(2)}</td>
    </tr>
  `;

  pricingTable.innerHTML = html;
}

/**
 * Handle payment button click
 */
async function handlePayNow() {
  // Validate terms acceptance
  const termsCheckbox = document.getElementById('terms-checkbox');
  const termsError = document.getElementById('terms-error');

  if (!termsCheckbox.checked) {
    termsError.textContent = 'You must accept the terms and conditions';
    termsError.classList.add('visible');
    termsCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  termsError.classList.remove('visible');

  // Get social addon selection
  const socialAddon = document.getElementById('social-addon');
  const socialMediaAddon = socialAddon ? socialAddon.checked : false;

  // Submit payment options
  await submitPaymentOptions(socialMediaAddon);
}

/**
 * Submit payment options and redirect to payment
 */
async function submitPaymentOptions(socialMediaAddon) {
  if (!currentOrder || !currentOrder.orderId) {
    showError('Order ID not found');
    return;
  }

  showLoading('Processing payment...');

  try {
    const response = await fetch('/api/audit/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: currentOrder.orderId,
        section: 'paymentOptions',
        data: {
          socialMediaAddon,
          termsAccepted: true
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment');
    }

    const result = await response.json();

    if (result.checkoutUrl) {
      // Redirect to payment URL
      window.location.href = result.checkoutUrl;
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error) {
    console.error('Payment failed:', error);
    hideLoading();
    showError('Failed to process payment. Please try again or contact support.');
  }
}

/**
 * Show loading overlay
 */
function showLoading(message = 'Loading...') {
  const overlay = document.getElementById('page-loading');
  if (overlay) {
    overlay.querySelector('.page-loading-text').textContent = message;
    overlay.classList.remove('hidden');
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById('page-loading');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

/**
 * Show error message
 */
function showError(message) {
  alert(message);
}
