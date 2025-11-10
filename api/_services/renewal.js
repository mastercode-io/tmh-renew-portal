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
      method: 'POST',
      query: { token }
    });
    return normalizePaymentLink(response);
  }

  if (!ENV.useMockData) {
    throw new Error('PAYMENT_LINK_UNAVAILABLE');
  }

  return getMockPaymentLink();
}

export async function fetchPaymentStatus(dealId) {
  if (!dealId) {
    throw new Error('DEAL_ID_REQUIRED');
  }

  if (isCrmConfigured()) {
    const response = await callCrm(CRM_ENDPOINTS.xeroInvoiceStatus, {
      query: { dealId }
    });
    return normalizePaymentStatus(response);
  }

  if (!ENV.useMockData) {
    throw new Error('PAYMENT_STATUS_UNAVAILABLE');
  }

  return {
    ...getMockPaymentStatus(),
    deal_id: dealId
  };
}

function normalizeRenewalDetails(response) {
  if (!response) return getMockRenewalPayload();

  if (response.account && response.contact && response.trademark) {
    return response;
  }

  const data = response.data || response;

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

  const data = response.data || response;

  return {
    deal_id: data.deal_id || data.dealId || data.DealId || null,
    deal_token: data.deal_token || data.dealToken || data.token || null,
    contact_id: data.contact_id || data.contactId || null,
    account_id: data.account_id || data.accountId || null,
    subtotal: data.subtotal || 0,
    vat: data.vat ?? data.tax ?? 0,
    total: data.total || 0,
    currency: data.currency || 'GBP',
    line_items: data.line_items || data.lineItems || []
  };
}

function normalizePaymentLink(response) {
  if (!response) return getMockPaymentLink();

  const data = response.data || response;

  if (data.payment_url) {
    return {
      ...data,
      deal_token: data.deal_token || data.dealToken || data.token || null
    };
  }

  return {
    payment_url: data.paymentUrl || data.payment_link || data.url || null,
    invoice_id: data.invoice_id || data.invoiceId || null,
    deal_id: data.deal_id || data.dealId || null,
    deal_token: data.deal_token || data.dealToken || data.token || null
  };
}

function normalizePaymentStatus(response) {
  if (!response) return getMockPaymentStatus();

  const data = response.data || response;

  if (data.status) return data;

  const invoices = data.Invoices || data.invoices || [];
  const invoice = Array.isArray(invoices) ? invoices[0] : null;
  const status = invoice?.Status || invoice?.status || data.payment_status || 'pending';

  return {
    deal_id: data.deal_id || data.dealId || null,
    invoice_id: data.invoice_id || data.invoiceId || invoice?.InvoiceID || invoice?.InvoiceId || null,
    status: status.toLowerCase(),
    updated_at: data.updated_at || data.updatedAt || invoice?.UpdatedDateUTC || new Date().toISOString()
  };
}
