/**
 * Audit Order Service Layer
 * Handles business logic for trademark audit orders
 * Follows renewal service pattern with mock data fallback
 */

import ENV from '../_lib/env.js';
import { CRM_ENDPOINTS, callCrm, isCrmConfigured } from '../_lib/crm.js';
import {
  getMockAuditUpdate,
  getMockAuditOrder,
  getMockAuditPaymentLink,
  getMockAuditLead
} from '../_lib/mock-data.js';

/**
 * Create or update audit order
 * Handles all section updates via unified endpoint pattern
 */
export async function createOrUpdateAuditOrder(orderId, section, data) {
  if (!section) {
    throw new Error('SECTION_REQUIRED');
  }

  if (!data) {
    throw new Error('DATA_REQUIRED');
  }

  // Validate orderId requirement for non-contact sections
  if (section !== 'contact' && !orderId) {
    throw new Error('ORDER_ID_REQUIRED');
  }

  const payload = {
    orderId: orderId || null,
    section,
    data
  };

  if (isCrmConfigured()) {
    const response = await callCrm(CRM_ENDPOINTS.auditUpdate, {
      method: 'POST',
      body: payload
    });

    return normalizeAuditUpdate(response, section);
  }

  if (!ENV.useMockData) {
    throw new Error('CRM_NOT_CONFIGURED');
  }

  return getMockAuditUpdate(section, data);
}

/**
 * Fetch complete audit order by ID
 * Used by summary and confirmation pages
 */
export async function fetchAuditOrder(orderId) {
  if (!orderId) {
    throw new Error('ORDER_ID_REQUIRED');
  }

  if (isCrmConfigured()) {
    const response = await callCrm(CRM_ENDPOINTS.auditGetOrder, {
      query: { orderId }
    });

    return normalizeAuditOrder(response);
  }

  if (!ENV.useMockData) {
    throw new Error('CRM_NOT_CONFIGURED');
  }

  return getMockAuditOrder(orderId);
}

/**
 * Create or update audit lead
 * Handles incremental lead updates for steps 1-7
 * @param {string|null} token - Lead token (null/omitted for first request)
 * @param {object} lead - Lead data (only new/changed fields)
 * @returns {Promise<{token: string, lead: object}>}
 */
export async function createOrUpdateLead(token, lead) {
  if (!lead) {
    throw new Error('LEAD_REQUIRED');
  }

  const payload = {
    ...(token && { token }), // Only include token if present
    lead
  };

  if (isCrmConfigured()) {
    const response = await callCrm(CRM_ENDPOINTS.auditCreateLead, {
      method: 'POST',
      body: payload
    });

    return normalizeLead(response);
  }

  if (!ENV.useMockData) {
    throw new Error('CRM_NOT_CONFIGURED');
  }

  return getMockAuditLead(token, lead);
}

/**
 * Create payment link for audit order
 * Follows renewal pattern with Xero integration via CRM
 */
export async function createAuditPaymentLink(orderId, paymentOptions) {
  if (!orderId) {
    throw new Error('ORDER_ID_REQUIRED');
  }

  if (!paymentOptions?.termsAccepted) {
    throw new Error('TERMS_NOT_ACCEPTED');
  }

  const payload = {
    orderId,
    socialMediaAddon: paymentOptions.socialMediaAddon || false,
    termsAccepted: paymentOptions.termsAccepted
  };

  if (isCrmConfigured()) {
    const response = await callCrm(CRM_ENDPOINTS.auditCreatePayment, {
      method: 'POST',
      body: payload
    });

    console.log('[createAuditPaymentLink] CRM raw response:', JSON.stringify(response));
    const normalized = normalizePaymentLink(response);
    console.log('[createAuditPaymentLink] Normalized result:', JSON.stringify(normalized));
    return normalized;
  }

  if (!ENV.useMockData) {
    throw new Error('PAYMENT_LINK_UNAVAILABLE');
  }

  return getMockAuditPaymentLink(orderId);
}

/**
 * Normalize lead response from CRM
 */
function normalizeLead(response) {
  if (!response) return getMockAuditLead(null, {});

  // If response already has token and lead, return as-is
  if (response.token && response.lead) {
    return response;
  }

  // Extract data from CRM response wrapper
  const data = response.crmAPIResponse?.body || response.data || response;

  return {
    token: data.token || data.Token || null,
    lead: data.lead || data.Lead || {}
  };
}

/**
 * Normalize audit update response from CRM
 */
function normalizeAuditUpdate(response, section) {
  if (!response) return getMockAuditUpdate(section, {});

  // If response already has orderId and success, return as-is
  if (response.orderId !== undefined && response.success !== undefined) {
    return response;
  }

  // Extract data from CRM response wrapper
  const data = response.crmAPIResponse?.body || response.data || response;

  const normalized = {
    orderId: data.orderId || data.order_id || data.OrderId || null,
    success: data.success !== false, // Default to true unless explicitly false
    message: data.message || null
  };

  // For paymentOptions section, include checkoutUrl
  if (section === 'paymentOptions') {
    normalized.checkoutUrl = data.checkoutUrl || data.checkout_url || data.payment_url || null;
  }

  return normalized;
}

/**
 * Normalize audit order response from CRM
 */
function normalizeAuditOrder(response) {
  if (!response) return getMockAuditOrder('unknown');

  // If response already has expected shape, return as-is
  if (response.orderId && response.sections) {
    return response;
  }

  // Extract data from CRM response wrapper
  const data = response.crmAPIResponse?.body || response.data || response;

  return {
    orderId: data.orderId || data.order_id || data.OrderId || null,
    dealId: data.dealId || data.deal_id || data.DealId || null,
    sections: data.sections || data.Sections || {},
    subtotal: parseFloat(data.subtotal || data.Subtotal || 0),
    vat: parseFloat(data.vat || data.VAT || data.tax || 0),
    total: parseFloat(data.total || data.Total || 0),
    currency: data.currency || data.Currency || 'GBP',
    created: data.created || data.Created_Time || data.createdAt || new Date().toISOString(),
    updated: data.updated || data.Modified_Time || data.updatedAt || new Date().toISOString(),
    status: data.status || data.Status || 'pending'
  };
}

/**
 * Normalize payment link response from CRM
 */
function normalizePaymentLink(response) {
  if (!response) return getMockAuditPaymentLink('unknown');

  // Extract data from CRM response wrapper
  const data = response.crmAPIResponse?.body || response.data || response;

  const paymentUrl = data.payment_url || data.paymentUrl || data.checkout_url || data.checkoutUrl || null;
  const orderId = data.orderId || data.order_id || data.OrderId || null;

  return {
    payment_url: paymentUrl,
    order_id: orderId
  };
}

/**
 * Validate section data structure
 */
export function validateSectionData(section, data) {
  const errors = {};

  switch (section) {
    case 'contact':
      if (!data.firstName) errors.firstName = 'First name is required';
      if (!data.lastName) errors.lastName = 'Last name is required';
      if (!data.email) errors.email = 'Email is required';
      if (!data.phone) errors.phone = 'Phone is required';
      break;

    case 'preferences':
      if (!data.methods || data.methods.length === 0) {
        errors.methods = 'At least one contact method is required';
      }
      break;

    case 'tmStatus':
      if (!data.status || (data.status !== 'existing' && data.status !== 'new')) {
        errors.status = 'Invalid trademark status';
      }
      break;

    case 'tmInfo':
      if (!data.types || data.types.length === 0) {
        errors.types = 'At least one trademark type is required';
      }
      if (!data.jurisdictions || data.jurisdictions.length === 0) {
        errors.jurisdictions = 'At least one jurisdiction is required';
      }
      break;

    case 'billing':
      if (!data.type) errors.type = 'Billing type is required';
      if (!data.name) errors.name = 'Billing name is required';
      if (!data.address || !data.address.postcode) {
        errors.postcode = 'Postcode is required';
      }
      break;

    case 'paymentOptions':
      if (!data.termsAccepted) {
        errors.termsAccepted = 'Terms must be accepted';
      }
      break;

    default:
      // Other sections (temmy, goods, appointment) are optional
      break;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
