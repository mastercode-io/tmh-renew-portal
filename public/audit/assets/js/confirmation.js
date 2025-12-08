/**
 * Audit Confirmation Page
 * Displays order confirmation and clears state
 */

document.addEventListener('DOMContentLoaded', () => {
  initConfirmationPage();
});

async function initConfirmationPage() {
  // Get orderId from URL
  const orderId = getOrderIdFromUrl();

  if (orderId) {
    // Load order details (optional)
    await loadOrderDetails(orderId);

    // Clear localStorage state (order complete)
    clearAuditState();
  } else {
    // If no orderId, just show generic confirmation
    setDefaultConfirmation();
  }
}

/**
 * Get order ID from URL query parameter
 */
function getOrderIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('orderId');
}

/**
 * Load order details (optional enhancement)
 */
async function loadOrderDetails(orderId) {
  try {
    const response = await fetch(`/api/audit/order/${orderId}`);

    if (!response.ok) {
      throw new Error('Failed to load order');
    }

    const order = await response.json();

    // Display order reference and date
    displayOrderInfo(order);
  } catch (error) {
    console.error('Failed to load order details:', error);
    // Fall back to generic display
    setDefaultConfirmation();
  }
}

/**
 * Display order information
 */
function displayOrderInfo(order) {
  const referenceEl = document.getElementById('order-reference');
  const dateEl = document.getElementById('order-date');

  if (referenceEl) {
    referenceEl.textContent = order.orderId || order.dealId || '-';
  }

  if (dateEl) {
    const date = order.created ? formatDate(order.created) : formatDate(new Date().toISOString());
    dateEl.textContent = date;
  }
}

/**
 * Set default confirmation when order details unavailable
 */
function setDefaultConfirmation() {
  const referenceEl = document.getElementById('order-reference');
  const dateEl = document.getElementById('order-date');

  if (referenceEl) {
    referenceEl.textContent = 'Confirmed';
  }

  if (dateEl) {
    dateEl.textContent = formatDate(new Date().toISOString());
  }
}

/**
 * Format date for display
 */
function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return '-';
  }
}

/**
 * Clear audit state from localStorage
 */
function clearAuditState() {
  try {
    localStorage.removeItem('audit_order_state');
  } catch (error) {
    console.error('Failed to clear audit state:', error);
  }
}
