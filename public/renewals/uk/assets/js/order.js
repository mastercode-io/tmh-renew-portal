/**
 * Order Page - Trademark Renewal Portal
 * Displays quote/order after form submission
 */

// Mock order data for development
// In production, this will come from API response payload
const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  VOIDED: 'voided',
  NOT_FOUND: 'not_found',
  FAILED: 'failed',
  TIMEOUT: 'timeout'
};

const PAYMENT_POLLING_CONFIG = {
  timeoutMs: 10 * 60 * 1000, // 10 minutes
  bannerDelayMs: 2 * 60 * 1000, // 2 minutes
  fastWindowMs: 30 * 1000,
  mediumWindowMs: 2 * 60 * 1000,
  fastIntervalMs: 2000,
  mediumIntervalMs: 5000,
  slowIntervalMs: 10000
};

const CONFIRMATION_URL = '/uk/confirmation.html';
const OFFER_FALLBACK_URL = '/uk/index.html';
const CONTACT_SUPPORT_EMAIL = 'support@thetrademarkhelpline.com';

let currentOrderData = null;

const paymentState = {
  token: null,
  paymentUrl: null,
  startTime: null,
  pollTimeoutId: null,
  inFlight: false,
  manualRecheckInFlight: false,
  pendingBannerShown: false,
  lastStatus: null,
  timedOut: false,
  active: false,
  bannerTimeoutId: null
};

const paymentStatusElements = {
  panel: document.getElementById('payment-status-panel'),
  title: document.getElementById('payment-status-title'),
  message: document.getElementById('payment-status-message'),
  actions: document.getElementById('payment-status-actions'),
  upsell: document.querySelector('.monitoring-upsell')
};

let recheckButtonRef = null;
const auxiliaryState = {
  bookCallBtn: document.getElementById('book-call-btn'),
  termsCheckbox: document.getElementById('terms-checkbox'),
  termsLabel: document.querySelector('.terms-checkbox')
};
const payNowButtonState = {
  button: null,
  defaultHtml: '',
  mode: 'default'
};

const TERMINAL_STATUS_CONTENT = {
  [PAYMENT_STATUS.VOIDED]: {
    tone: 'danger',
    title: 'Invoice cancelled',
    message: 'This invoice was cancelled.',
    actions: ['offer', 'contact'],
    replaceUpsell: true
  },
  [PAYMENT_STATUS.NOT_FOUND]: {
    tone: 'danger',
    title: 'Payment link unavailable',
    message: 'This payment link is no longer available.',
    actions: ['offer', 'contact'],
    replaceUpsell: true
  },
  [PAYMENT_STATUS.FAILED]: {
    tone: 'warning',
    title: 'Payment not completed',
    message: 'Payment was not completed.',
    actions: ['reopen', 'recheck', 'contact'],
    replaceUpsell: true
  },
  [PAYMENT_STATUS.TIMEOUT]: {
    tone: 'warning',
    title: 'Payment not detected',
    message: 'We didn’t detect a completed payment.',
    actions: ['reopen', 'recheck', 'contact'],
    replaceUpsell: true
  }
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

function ensurePayNowButton() {
  if (payNowButtonState.button && payNowButtonState.button.isConnected) {
    return payNowButtonState.button;
  }
  const btn = document.getElementById('pay-now-btn');
  if (btn) {
    payNowButtonState.button = btn;
    payNowButtonState.defaultHtml = btn.innerHTML;
  }
  return btn;
}

function setPayNowButtonMode(mode = 'default', labelText = '') {
  const btn = ensurePayNowButton();
  if (!btn) return;
  payNowButtonState.mode = mode;
  const disableAux = mode === 'loading' || mode === 'waiting';
  setAuxiliaryActionsDisabled(disableAux);

  if (mode === 'loading' || mode === 'waiting') {
    const text =
      labelText || (mode === 'loading' ? 'Processing your renewal...' : 'Waiting for payment...');
    btn.disabled = true;
    btn.classList.add('btn-loading');
    btn.innerHTML = `<span class="btn-text"><span class="spinner"></span>${text}</span>`;
  } else {
    btn.disabled = false;
    btn.classList.remove('btn-loading');
    btn.innerHTML = payNowButtonState.defaultHtml || '<span>No - I want to pay now</span>';
  }
}

function setAuxiliaryActionsDisabled(isDisabled) {
  const bookBtn = auxiliaryState.bookCallBtn || document.getElementById('book-call-btn');
  if (bookBtn) {
    auxiliaryState.bookCallBtn = bookBtn;
    if (isDisabled) {
      bookBtn.classList.add('is-disabled');
      bookBtn.setAttribute('aria-disabled', 'true');
      if (!bookBtn.dataset.originalTabindex) {
        const currentTabindex = bookBtn.getAttribute('tabindex');
        if (currentTabindex !== null) {
          bookBtn.dataset.originalTabindex = currentTabindex;
        }
      }
      bookBtn.setAttribute('tabindex', '-1');
    } else {
      bookBtn.classList.remove('is-disabled');
      bookBtn.removeAttribute('aria-disabled');
      if (bookBtn.dataset.originalTabindex !== undefined) {
        if (bookBtn.dataset.originalTabindex) {
          bookBtn.setAttribute('tabindex', bookBtn.dataset.originalTabindex);
        } else {
          bookBtn.removeAttribute('tabindex');
        }
        delete bookBtn.dataset.originalTabindex;
      } else {
        bookBtn.removeAttribute('tabindex');
      }
    }
  }

  const termsCheckbox = auxiliaryState.termsCheckbox || document.getElementById('terms-checkbox');
  if (termsCheckbox) {
    auxiliaryState.termsCheckbox = termsCheckbox;
    termsCheckbox.disabled = isDisabled;
  }

  const termsLabel = auxiliaryState.termsLabel || document.querySelector('.terms-checkbox');
  if (termsLabel) {
    auxiliaryState.termsLabel = termsLabel;
    termsLabel.classList.toggle('is-disabled', isDisabled);
  }
}

function clearPendingBannerTimer() {
  if (paymentState.bannerTimeoutId) {
    clearTimeout(paymentState.bannerTimeoutId);
    paymentState.bannerTimeoutId = null;
  }
}

function schedulePendingBanner(remainingMs) {
  if (paymentState.pendingBannerShown || paymentState.bannerTimeoutId) return;
  const delay =
    typeof remainingMs === 'number'
      ? Math.max(remainingMs, 0)
      : Math.max(PAYMENT_POLLING_CONFIG.bannerDelayMs - getElapsedTime(), 0);
  paymentState.bannerTimeoutId = window.setTimeout(() => {
    paymentState.bannerTimeoutId = null;
    if (!paymentState.active || paymentState.timedOut || paymentState.pendingBannerShown) return;
    showPendingBanner();
  }, delay);
}

function showPendingBanner() {
  if (paymentState.pendingBannerShown) return;
  showPaymentStatusPanel({
    tone: 'info',
    title: 'Waiting for your payment...',
    message: 'We’re waiting for your payment to complete in the other tab. This page will update automatically.',
    replaceUpsell: false
  });
  paymentState.pendingBannerShown = true;
}

function resetPendingBannerState() {
  clearPendingBannerTimer();
  paymentState.pendingBannerShown = false;
}

function ensurePendingBannerScheduled() {
  if (!paymentState.active || paymentState.timedOut) return;
  if (!paymentState.startTime) {
    paymentState.startTime = Date.now();
  }
  const elapsed = getElapsedTime();
  if (elapsed >= PAYMENT_POLLING_CONFIG.bannerDelayMs) {
    showPendingBanner();
  } else {
    schedulePendingBanner(PAYMENT_POLLING_CONFIG.bannerDelayMs - elapsed);
  }
}

function rememberOfferUrl() {
  try {
    const referrer = document.referrer || '';
    if (referrer && referrer !== window.location.href) {
      sessionStorage.setItem('renewal_offer_url', referrer);
    } else if (!sessionStorage.getItem('renewal_offer_url')) {
      sessionStorage.setItem('renewal_offer_url', OFFER_FALLBACK_URL);
    }
  } catch (error) {
    console.warn('Unable to store offer URL', error);
  }
}

function getOfferUrl() {
  try {
    return sessionStorage.getItem('renewal_offer_url') || OFFER_FALLBACK_URL;
  } catch (error) {
    return OFFER_FALLBACK_URL;
  }
}

function clearPaymentSessionData() {
  try {
    sessionStorage.removeItem('renewal_order_data');
    sessionStorage.removeItem('payment_completed');
  } catch (error) {
    console.warn('Unable to clear payment session data', error);
  }
}

function navigateToOffer() {
  window.location.href = getOfferUrl();
}

function buildStatusAction(action) {
  switch (action) {
    case 'offer': {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-ghost btn-sm';
      btn.textContent = 'Go back to the offer';
      btn.addEventListener('click', navigateToOffer);
      return btn;
    }
    case 'contact': {
      const link = document.createElement('a');
      link.className = 'btn btn-outline btn-sm';
      link.href = `mailto:${CONTACT_SUPPORT_EMAIL}?subject=Renewal%20payment%20support`;
      link.textContent = 'Contact support';
      link.rel = 'noopener';
      return link;
    }
    case 'reopen': {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary btn-sm';
      btn.textContent = 'Reopen payment page';
      btn.addEventListener('click', handleReopenPayment);
      return btn;
    }
    case 'recheck': {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-outline btn-sm';
      btn.textContent = 'I completed the payment';
      btn.dataset.action = 'recheck';
      btn.addEventListener('click', handleManualRecheck);
      return btn;
    }
    default:
      return null;
  }
}

function renderStatusActions(actionKeys = []) {
  if (!paymentStatusElements.actions) return;
  paymentStatusElements.actions.innerHTML = '';
  recheckButtonRef = null;

  actionKeys.forEach(key => {
    const actionEl = buildStatusAction(key);
    if (actionEl) {
      paymentStatusElements.actions.appendChild(actionEl);
      if (actionEl.dataset?.action === 'recheck') {
        recheckButtonRef = actionEl;
      }
    }
  });

  paymentStatusElements.actions.hidden = actionKeys.length === 0;
}

function showPaymentStatusPanel(config = {}) {
  if (!paymentStatusElements.panel) return;
  const { tone = 'info', title = '', message = '', actions = [], replaceUpsell = false } = config;
  paymentStatusElements.panel.hidden = false;
  paymentStatusElements.panel.classList.add('is-visible');
  paymentStatusElements.panel.classList.remove('is-info', 'is-warning', 'is-danger');
  const toneClass = tone === 'danger' ? 'is-danger' : tone === 'warning' ? 'is-warning' : 'is-info';
  paymentStatusElements.panel.classList.add(toneClass);

  if (paymentStatusElements.title) {
    paymentStatusElements.title.textContent = title;
    paymentStatusElements.title.style.display = title ? 'block' : 'none';
  }

  if (paymentStatusElements.message) {
    paymentStatusElements.message.textContent = message;
  }

  renderStatusActions(actions);

  if (paymentStatusElements.upsell) {
    paymentStatusElements.upsell.hidden = replaceUpsell;
    paymentStatusElements.upsell.setAttribute('aria-hidden', replaceUpsell ? 'true' : 'false');
  }
}

function hidePaymentStatusPanel() {
  if (!paymentStatusElements.panel) return;
  paymentStatusElements.panel.hidden = true;
  paymentStatusElements.panel.classList.remove('is-visible', 'is-info', 'is-warning', 'is-danger');
  if (paymentStatusElements.title) paymentStatusElements.title.textContent = '';
  if (paymentStatusElements.message) paymentStatusElements.message.textContent = '';
  if (paymentStatusElements.actions) paymentStatusElements.actions.innerHTML = '';
  recheckButtonRef = null;
  if (paymentStatusElements.upsell) {
    paymentStatusElements.upsell.hidden = false;
    paymentStatusElements.upsell.setAttribute('aria-hidden', 'false');
  }
}

function getElapsedTime() {
  if (!paymentState.startTime) return 0;
  return Date.now() - paymentState.startTime;
}

function getPollInterval() {
  const elapsed = getElapsedTime();
  if (elapsed < PAYMENT_POLLING_CONFIG.fastWindowMs) {
    return PAYMENT_POLLING_CONFIG.fastIntervalMs;
  }
  if (elapsed < PAYMENT_POLLING_CONFIG.mediumWindowMs) {
    return PAYMENT_POLLING_CONFIG.mediumIntervalMs;
  }
  return PAYMENT_POLLING_CONFIG.slowIntervalMs;
}

function scheduleNextPoll() {
  if (!paymentState.active || paymentState.timedOut) return;
  if (paymentState.pollTimeoutId) {
    clearTimeout(paymentState.pollTimeoutId);
  }

  const elapsed = getElapsedTime();
  if (elapsed >= PAYMENT_POLLING_CONFIG.timeoutMs) {
    handleTimeout();
    return;
  }

  const delay = getPollInterval();
  paymentState.pollTimeoutId = window.setTimeout(async () => {
    paymentState.pollTimeoutId = null;
    await performStatusCheck();
  }, delay);
}

function normalizeStatus(value) {
  if (!value || typeof value !== 'string') {
    return PAYMENT_STATUS.PENDING;
  }
  const normalized = value.toLowerCase();
  if (
    normalized === PAYMENT_STATUS.PAID ||
    normalized === PAYMENT_STATUS.PENDING ||
    normalized === PAYMENT_STATUS.VOIDED ||
    normalized === PAYMENT_STATUS.NOT_FOUND ||
    normalized === PAYMENT_STATUS.FAILED
  ) {
    return normalized;
  }
  return PAYMENT_STATUS.PENDING;
}

async function performStatusCheck(options = {}) {
  if (!paymentState.token) return null;
  if (!paymentState.active && !options.allowWhenInactive && !paymentState.manualRecheckInFlight) {
    return null;
  }

  if (paymentState.inFlight) {
    return paymentState.lastStatus;
  }

  const elapsed = getElapsedTime();
  if (!options.ignoreTimeout && elapsed >= PAYMENT_POLLING_CONFIG.timeoutMs && !paymentState.timedOut) {
    handleTimeout();
    return PAYMENT_STATUS.TIMEOUT;
  }

  paymentState.inFlight = true;

  try {
    const response = await fetch(`/api/renewals/payment-status?token=${encodeURIComponent(paymentState.token)}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment status');
    }

    const payload = await response.json();
    const status = normalizeStatus(payload.status);
    maybeShowPendingBanner();
    paymentState.lastStatus = status;

    if (status === PAYMENT_STATUS.PAID) {
      handlePaidStatus();
    } else if (
      status === PAYMENT_STATUS.VOIDED ||
      status === PAYMENT_STATUS.NOT_FOUND ||
      status === PAYMENT_STATUS.FAILED
    ) {
      handleTerminalStatus(status);
    } else {
      handlePendingStatus();
      if (!options.skipSchedule && paymentState.active && !paymentState.timedOut) {
        scheduleNextPoll();
      }
    }

    return status;
  } catch (error) {
    console.error('Payment status check failed:', error);
    if (!options.skipSchedule && paymentState.active && !paymentState.timedOut) {
      scheduleNextPoll();
    }
    return null;
  } finally {
    paymentState.inFlight = false;
  }
}

function maybeShowPendingBanner() {
  if (!paymentState.active || paymentState.timedOut) return;
  if (!paymentState.startTime) return;
  if (paymentState.pendingBannerShown) return;
  if (Date.now() - paymentState.startTime >= PAYMENT_POLLING_CONFIG.bannerDelayMs) {
    showPendingBanner();
  }
}

function handlePendingStatus() {
  setPayNowButtonMode('waiting', 'Waiting for payment...');

  if (!paymentState.startTime) {
    paymentState.startTime = Date.now();
  }

  maybeShowPendingBanner();
}

function handlePaidStatus() {
  stopPaymentMonitoring();
  hidePaymentStatusPanel();

  // Store token in sessionStorage for confirmation page validation
  if (paymentState.token) {
    sessionStorage.setItem('payment_completed', paymentState.token);
  }

  // Redirect to confirmation with token in URL
  const confirmUrl = paymentState.token
    ? `${CONFIRMATION_URL}?token=${encodeURIComponent(paymentState.token)}`
    : CONFIRMATION_URL;

  window.location.href = confirmUrl;
}

function handleTerminalStatus(statusKey) {
  const config = TERMINAL_STATUS_CONTENT[statusKey];
  stopPaymentMonitoring({ keepPanel: true });
  setPayNowButtonMode('default');
  clearPendingBannerTimer();
  if (config) {
    showPaymentStatusPanel(config);
  }
}

function handleTimeout() {
  paymentState.timedOut = true;
  paymentState.active = false;
  stopPaymentMonitoring({ keepPanel: true });
  handleTerminalStatus(PAYMENT_STATUS.TIMEOUT);
}

function stopPaymentMonitoring(options = {}) {
  if (paymentState.pollTimeoutId) {
    clearTimeout(paymentState.pollTimeoutId);
    paymentState.pollTimeoutId = null;
  }
  resetPendingBannerState();
  paymentState.active = false;
  paymentState.inFlight = false;
  if (!options.keepPanel) {
    hidePaymentStatusPanel();
  }
}

function startPaymentMonitoring(token, paymentUrl, { resetStartTime = true } = {}) {
  if (!token || !paymentUrl) return;
  stopPaymentMonitoring();
  paymentState.token = token;
  paymentState.paymentUrl = paymentUrl;
  resetPendingBannerState();
  paymentState.timedOut = false;
  paymentState.active = true;
  paymentState.manualRecheckInFlight = false;
  paymentState.lastStatus = null;
  if (resetStartTime || !paymentState.startTime) {
    paymentState.startTime = Date.now();
  }
  ensurePendingBannerScheduled();
  setPayNowButtonMode('waiting', 'Waiting for payment...');
  performStatusCheck();
}

function setRecheckButtonLoading(isLoading) {
  if (!recheckButtonRef) return;
  if (isLoading) {
    recheckButtonRef.disabled = true;
    if (!recheckButtonRef.dataset.originalLabel) {
      recheckButtonRef.dataset.originalLabel = recheckButtonRef.innerHTML;
    }
    recheckButtonRef.innerHTML = '<span class="btn-text"><span class="spinner spinner-pink"></span>Checking status...</span>';
  } else {
    recheckButtonRef.disabled = false;
    if (recheckButtonRef.dataset.originalLabel) {
      recheckButtonRef.innerHTML = recheckButtonRef.dataset.originalLabel;
      delete recheckButtonRef.dataset.originalLabel;
    }
  }
}

function handleReopenPayment() {
  if (!paymentState.paymentUrl) {
    console.warn('No payment URL available to reopen.');
    return;
  }
  if (!paymentState.token) {
    console.warn('No deal token available to resume polling.');
    return;
  }

  const paymentWindow = window.open(paymentState.paymentUrl, '_blank');
  if (!paymentWindow) {
    alert('Popup blocked. Please allow popups for this site and try again.');
    return;
  }
  paymentWindow.opener = null;

  startPaymentMonitoring(paymentState.token, paymentState.paymentUrl, { resetStartTime: true });
}

async function handleManualRecheck() {
  if (paymentState.manualRecheckInFlight) return;
  if (!paymentState.token) return;

  paymentState.manualRecheckInFlight = true;
  setRecheckButtonLoading(true);

  if (paymentState.pollTimeoutId) {
    clearTimeout(paymentState.pollTimeoutId);
    paymentState.pollTimeoutId = null;
  }

  try {
    const status = await performStatusCheck({
      skipSchedule: true,
      allowWhenInactive: true,
      ignoreTimeout: paymentState.timedOut
    });

    if (status === PAYMENT_STATUS.PAID) {
      return;
    }

    if (
      status === PAYMENT_STATUS.VOIDED ||
      status === PAYMENT_STATUS.NOT_FOUND ||
      status === PAYMENT_STATUS.FAILED
    ) {
      handleTerminalStatus(status);
      return;
    }

    if (status === PAYMENT_STATUS.PENDING && !paymentState.timedOut) {
      paymentState.active = true;
      resetPendingBannerState();
      hidePaymentStatusPanel();
      ensurePendingBannerScheduled();
      setPayNowButtonMode('waiting', 'Waiting for payment...');
      scheduleNextPoll();
      handlePendingStatus();
    }
  } finally {
    paymentState.manualRecheckInFlight = false;
    setRecheckButtonLoading(false);
  }
}

/**
 * Save order data to sessionStorage for persistence
 */
function saveOrderData(data) {
  try {
    const encoded = base64EncodeJson(data);
    sessionStorage.setItem('renewal_order_data', encoded);
  } catch (error) {
    console.warn('Unable to save order data', error);
  }
}

/**
 * Load order data from the URL or injected payload
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

function showErrorBanner(message) {
  const errorBanner = document.getElementById('token-error-banner');
  const errorMessage = document.getElementById('error-banner-message');
  const mainContent = document.getElementById('main');

  if (errorBanner) {
    errorBanner.classList.remove('hidden');
    if (errorMessage && message) {
      errorMessage.innerHTML = message;
    }
  }

  // Hide main content when error is shown
  if (mainContent) {
    mainContent.style.display = 'none';
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

  console.log('No valid order data found');
  return null;
}

/**
 * Initialize order page
 */
function initOrderPage() {
  const orderData = loadOrderData();

  if (!orderData) {
    console.log('No order data found, showing error banner');
    showErrorBanner();
    return;
  }

  currentOrderData = orderData;
  rememberOfferUrl();

  // Reset payment state and hide any stale panels on page load
  stopPaymentMonitoring();
  hidePaymentStatusPanel();
  paymentState.lastStatus = null;

  // Populate all sections
  populateTrademarkInfo(orderData.trademark);
  populateOrderItems(orderData.line_items);
  populateOrderTotals(orderData);
  updatePaymentLink(orderData.payment_url);
  if (orderData.payment_url) {
    paymentState.paymentUrl = orderData.payment_url;
  }
  if (orderData.deal_token || orderData.dealToken) {
    paymentState.token = orderData.deal_token || orderData.dealToken;
  }

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
    ensurePayNowButton();
    setPayNowButtonMode('default');
    payNowBtn.addEventListener('click', async function(e) {
      // Always prevent default navigation
      e.preventDefault();

      if (!termsCheckbox.checked) {
        termsError.textContent = 'Please accept the terms and conditions to proceed.';
        termsError.style.display = 'block';
        termsCheckbox.focus();

        // Scroll to terms section
        const termsSection = document.querySelector('.terms-section');
        if (termsSection) {
          termsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Terms are checked, proceed with payment link creation
      termsError.style.display = 'none';

      // Add loading spinner to Pay Now button
      setPayNowButtonMode('loading', 'Creating payment link...');

      // Clear any stale payment session data from previous attempts
      clearPaymentSessionData();

      try {
        // Use current order data to extract deal token
        const orderData = currentOrderData;
        const dealToken = orderData.deal_token || orderData.dealToken;

        if (!dealToken) {
          throw new Error('Order token not found. Please refresh the page and try again.');
        }

        // Call payment link API
        console.log('[Payment] Requesting payment link for token:', dealToken);
        const response = await fetch(`/api/renewals/payment-link?token=${encodeURIComponent(dealToken)}`, {
          method: 'GET',
          credentials: 'include'
        });

        console.log('[Payment] Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[Payment] Error response:', errorData);
          throw new Error(errorData.message || 'Failed to create payment link');
        }

        const data = await response.json();
        console.log('[Payment] Received data:', JSON.stringify(data, null, 2));

        if (!data.payment_url) {
          console.error('[Payment] Missing payment_url in response. Available keys:', Object.keys(data));
          throw new Error('Payment link not available. Please try again.');
        }

        currentOrderData = {
          ...orderData,
          payment_url: data.payment_url,
          deal_token: dealToken
        };
        saveOrderData(currentOrderData);
        paymentState.paymentUrl = data.payment_url;
        paymentState.token = dealToken;

        // Open payment link in new tab
        const paymentWindow = window.open(data.payment_url, '_blank');

        if (!paymentWindow) {
          // Popup was blocked
          throw new Error('Popup blocked. Please allow popups for this site and try again.');
        }

        paymentWindow.opener = null;

        startPaymentMonitoring(dealToken, data.payment_url, { resetStartTime: true });

      } catch (error) {
        console.error('Payment link creation failed:', error);

        setPayNowButtonMode('default');

        // Display error message
        termsError.textContent = error.message || 'Failed to create payment link. Please try again.';
        termsError.style.display = 'block';

        // Scroll to error
        const termsSection = document.querySelector('.terms-section');
        if (termsSection) {
          termsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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

window.addEventListener('beforeunload', () => stopPaymentMonitoring());
window.addEventListener('pagehide', () => stopPaymentMonitoring());
window.addEventListener('focus', () => {
  if (!paymentState.active || paymentState.pendingBannerShown) return;
  ensurePendingBannerScheduled();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (!paymentState.active || paymentState.pendingBannerShown) return;
  ensurePendingBannerScheduled();
});

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
  return `/uk/order.html?order=${encodeURIComponent(encodedData)}`;
};
