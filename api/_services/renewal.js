import ENV from '../_lib/env.js';
import { CRM_ENDPOINTS, callCrm, isCrmConfigured } from '../_lib/crm.js';
import {
  getMockOrderSummary,
  getMockPaymentLink,
  getMockPaymentStatus,
  getMockRenewalPayload
} from '../_lib/mock-data.js';

export async function fetchRenewalDetails(token) {
  if (!token) {
    throw new Error('TOKEN_REQUIRED');
  }

  if (isCrmConfigured()) {
    const response = await callCrm(CRM_ENDPOINTS.renewalDetails, {
      query: { token }
    });
    return normalizeRenewalDetails(response);
  }

  if (!ENV.useMockData) {
    throw new Error('CRM_NOT_CONFIGURED');
  }

  return getMockRenewalPayload(token);
}

export async function submitRenewalOrder(body) {
  if (!body) {
    throw new Error('ORDER_PAYLOAD_REQUIRED');
  }

  if (isCrmConfigured()) {
    const response = await callCrm(CRM_ENDPOINTS.renewalOrder, {
      method: 'POST',
      body
    });

    return normalizeOrderSummary(response);
  }

  if (!ENV.useMockData) {
    throw new Error('CRM_NOT_CONFIGURED');
  }

  return getMockOrderSummary();
}

export async function fetchRenewalOrderSummary(dealToken) {
  if (!dealToken) {
    throw new Error('TOKEN_REQUIRED');
  }

  if (isCrmConfigured()) {
    const response = await callCrm(CRM_ENDPOINTS.renewalOrderSummary, {
      query: { token: dealToken }
    });
    return normalizeOrderSummary(response);
  }

  if (!ENV.useMockData) {
    throw new Error('CRM_NOT_CONFIGURED');
  }

  const mock = getMockOrderSummary();
  return {
    ...mock,
    deal_id: mock.deal_id || null,
    deal_token: dealToken || mock.deal_token
  };
}

export async function createOrRetrievePaymentLink(token) {
  if (!token) {
    throw new Error('TOKEN_REQUIRED');
  }

  if (isCrmConfigured()) {
    const response = await callCrm(CRM_ENDPOINTS.xeroInvoiceLink, {
      query: { token }
    });
    console.log('[createOrRetrievePaymentLink] CRM raw response:', JSON.stringify(response));
    const normalized = normalizePaymentLink(response);
    console.log('[createOrRetrievePaymentLink] Normalized result:', JSON.stringify(normalized));
    return normalized;
  }

  if (!ENV.useMockData) {
    throw new Error('PAYMENT_LINK_UNAVAILABLE');
  }

  return getMockPaymentLink();
}

export async function fetchPaymentStatus(token) {
  if (!token) {
    throw new Error('TOKEN_REQUIRED');
  }

  if (isCrmConfigured()) {
    const response = await callCrm(CRM_ENDPOINTS.xeroInvoiceStatus, {
      query: { token }
    });
    return normalizePaymentStatus(response);
  }

  if (!ENV.useMockData) {
    throw new Error('PAYMENT_STATUS_UNAVAILABLE');
  }

  return getMockPaymentStatus(token);
}

function normalizeRenewalDetails(response) {
  if (!response) return getMockRenewalPayload();

  if (response.account && response.contact && response.trademark) {
    return response;
  }

  // Extract data from CRM response wrapper or legacy formats
  const data = response.crmAPIResponse?.body || response.data || response;

  return {
    account: data.account || data.Account || {},
    contact: data.contact || data.Contact || {},
    trademark: data.trademark || data.Trademark || {},
    next_due: data.next_due || data.nextDue || [],
    links: data.links || data.Links || undefined
  };
}

function normalizeOrderSummary(response) {
  if (!response) return getMockOrderSummary();

  if (response.deal_id && response.line_items) {
    return response;
  }

  // Extract data from CRM response wrapper or legacy formats
  const data = response.crmAPIResponse?.body || response.data || response;

  return {
    deal_id: data.deal_id || data.dealId || data.DealId || null,
    deal_token: data.deal_token || data.dealToken || data.token || null,
    contact_id: data.contact_id || data.contactId || null,
    account_id: data.account_id || data.accountId || null,
    subtotal: data.subtotal || 0,
    vat: data.vat ?? data.tax ?? 0,
    total: data.total || 0,
    currency: data.currency || 'GBP',
    line_items: data.line_items || data.lineItems || [],
    trademark: data.trademark || {}
  };
}

function normalizePaymentLink(response) {
  if (!response) return getMockPaymentLink();

  // Extract data from CRM response wrapper or legacy formats
  const data = response.crmAPIResponse?.body || response.data || response;
  const paymentUrl = data.payment_url || data.paymentUrl || data.payment_link || data.url || null;
  const dealToken = data.deal_token || data.dealToken || data.token || null;

  return {
    payment_url: paymentUrl,
    deal_token: dealToken
  };
}

function normalizePaymentStatus(response) {
  if (!response) return getMockPaymentStatus();

  // Extract data from CRM response wrapper or legacy formats
  const data = response.crmAPIResponse?.body || response.data || response;
  const invoices = data.Invoices || data.invoices || [];
  const invoice = Array.isArray(invoices) ? invoices[0] : null;

  const statusValue = data.status || invoice?.Status || invoice?.status || data.payment_status || 'pending';
  const updatedAt =
    data.updated_at ||
    data.updatedAt ||
    invoice?.UpdatedDateUTC ||
    invoice?.UpdatedDateUtc ||
    new Date().toISOString();
  const dealToken = data.deal_token || data.dealToken || data.token || invoice?.Token || null;

  return {
    deal_token: dealToken,
    status: statusValue.toLowerCase(),
    updated_at: updatedAt
  };
}
